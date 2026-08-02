package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
)

const maxUploadBytes = 8 << 20 // 8 MiB

// allowedImageTypes maps an accepted MIME type to its canonical extension.
// Sniffed from file content, not from the client-supplied filename. SVG is
// deliberately excluded: SVG can embed script, and serving it from a public
// uploads path is a stored-XSS vector.
var allowedImageTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
}

// UploadMedia accepts a single image under the "file" form field, stores it with
// a random name, and records it in the media library.
func (h *Handler) UploadMedia(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadBytes+1024)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Berkas tidak ditemukan pada field 'file'"})
		return
	}
	if fileHeader.Size > maxUploadBytes {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "Ukuran berkas melebihi 8 MB"})
		return
	}

	src, err := fileHeader.Open()
	if err != nil {
		serverError(c, err)
		return
	}
	defer src.Close()

	// Sniff the real content type from the first bytes rather than trusting
	// the client's Content-Type header or the filename extension.
	head := make([]byte, 512)
	n, err := io.ReadFull(src, head)
	if err != nil && err != io.ErrUnexpectedEOF && err != io.EOF {
		serverError(c, err)
		return
	}
	head = head[:n]

	mimeType := http.DetectContentType(head)
	if i := strings.Index(mimeType, ";"); i > -1 {
		mimeType = strings.TrimSpace(mimeType[:i])
	}

	// DetectContentType reports SVG as text/xml or text/plain.
	if mimeType == "text/xml" || mimeType == "text/plain" {
		if strings.Contains(strings.ToLower(string(head)), "<svg") {
			mimeType = "image/svg+xml"
		}
	}

	ext, ok := allowedImageTypes[mimeType]
	if !ok {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{
			"error": "Tipe berkas tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau SVG.",
		})
		return
	}

	if _, err := src.Seek(0, io.SeekStart); err != nil {
		serverError(c, err)
		return
	}

	// Random filename: prevents path traversal, collisions, and guessing.
	randBytes := make([]byte, 16)
	if _, err := rand.Read(randBytes); err != nil {
		serverError(c, err)
		return
	}
	subdir := time.Now().UTC().Format("2006/01")
	fileName := hex.EncodeToString(randBytes) + ext
	relPath := filepath.ToSlash(filepath.Join(subdir, fileName))

	destDir := filepath.Join(h.UploadDir, subdir)
	if err := os.MkdirAll(destDir, 0o755); err != nil {
		serverError(c, err)
		return
	}

	destPath := filepath.Join(destDir, fileName)
	dst, err := os.OpenFile(destPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if err != nil {
		serverError(c, err)
		return
	}

	written, err := io.Copy(dst, io.LimitReader(src, maxUploadBytes))
	closeErr := dst.Close()
	if err != nil || closeErr != nil {
		os.Remove(destPath)
		serverError(c, fmt.Errorf("gagal menulis berkas"))
		return
	}

	userID, _ := c.Get("userID")
	uploadedBy, _ := userID.(uint)

	asset := models.MediaAsset{
		FileName:     relPath,
		OriginalName: filepath.Base(fileHeader.Filename),
		URL:          strings.TrimRight(h.PublicURL, "/") + "/uploads/" + relPath,
		MimeType:     mimeType,
		SizeBytes:    written,
		UploadedBy:   uploadedBy,
		CreatedAt:    time.Now(),
	}
	if err := h.DB.Create(&asset).Error; err != nil {
		os.Remove(destPath)
		serverError(c, err)
		return
	}

	c.JSON(http.StatusCreated, asset)
}

func (h *Handler) AdminListMedia(c *gin.Context) {
	var assets []models.MediaAsset
	if err := h.DB.Order("created_at desc").Limit(200).Find(&assets).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, assets)
}

func (h *Handler) AdminDeleteMedia(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}

	var asset models.MediaAsset
	if err := h.DB.First(&asset, id).Error; err != nil {
		notFound(c, "Media tidak ditemukan")
		return
	}

	// Resolve and confine the path inside the upload dir before deleting.
	cleaned := filepath.Clean(filepath.Join(h.UploadDir, filepath.FromSlash(asset.FileName)))
	root := filepath.Clean(h.UploadDir)
	if strings.HasPrefix(cleaned, root+string(os.PathSeparator)) {
		os.Remove(cleaned)
	}

	if err := h.DB.Delete(&models.MediaAsset{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Media berhasil dihapus"})
}
