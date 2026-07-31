package controllers

import (
	"net/http"
	"strings"
	"time"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
)

func (h *Handler) AdminGetStats(c *gin.Context) {
	var solutions, articles, drafts, inquiries, unread, media int64

	h.DB.Model(&models.Solution{}).Count(&solutions)
	h.DB.Model(&models.Article{}).Where("status = ?", "published").Count(&articles)
	h.DB.Model(&models.Article{}).Where("status = ?", "draft").Count(&drafts)
	h.DB.Model(&models.ContactMessage{}).Count(&inquiries)
	h.DB.Model(&models.ContactMessage{}).Where("status = ?", "new").Count(&unread)
	h.DB.Model(&models.MediaAsset{}).Count(&media)

	c.JSON(http.StatusOK, gin.H{
		"total_solutions":  solutions,
		"total_articles":   articles,
		"total_drafts":     drafts,
		"total_inquiries":  inquiries,
		"unread_inquiries": unread,
		"total_media":      media,
	})
}

// ---------------------------------------------------------------
// SOLUTIONS
// ---------------------------------------------------------------

func (h *Handler) AdminGetSolutions(c *gin.Context) {
	var solutions []models.Solution
	err := h.DB.
		Preload("Features", byOrder).
		Preload("UseCases", byOrder).
		Order(`"order" asc`).
		Find(&solutions).Error
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, solutions)
}

func (h *Handler) AdminCreateSolution(c *gin.Context) {
	var solution models.Solution
	if err := c.ShouldBindJSON(&solution); err != nil {
		badRequest(c, err)
		return
	}
	if strings.TrimSpace(solution.Slug) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Slug wajib diisi"})
		return
	}
	solution.ID = 0
	if err := h.DB.Create(&solution).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusCreated, solution)
}

func (h *Handler) AdminUpdateSolution(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}

	var existing models.Solution
	if err := h.DB.First(&existing, id).Error; err != nil {
		notFound(c, "Solusi tidak ditemukan")
		return
	}

	var payload models.Solution
	if err := c.ShouldBindJSON(&payload); err != nil {
		badRequest(c, err)
		return
	}
	payload.ID = existing.ID
	payload.CreatedAt = existing.CreatedAt

	// Children are replaced wholesale so the editor can reorder and remove rows
	// in one request without tracking individual child IDs.
	features := payload.Features
	useCases := payload.UseCases
	payload.Features = nil
	payload.UseCases = nil

	tx := h.DB.Begin()
	if err := tx.Save(&payload).Error; err != nil {
		tx.Rollback()
		serverError(c, err)
		return
	}
	if err := tx.Where("solution_id = ?", existing.ID).Delete(&models.SolutionFeature{}).Error; err != nil {
		tx.Rollback()
		serverError(c, err)
		return
	}
	if err := tx.Where("solution_id = ?", existing.ID).Delete(&models.SolutionUseCase{}).Error; err != nil {
		tx.Rollback()
		serverError(c, err)
		return
	}
	for i := range features {
		features[i].ID = 0
		features[i].SolutionID = existing.ID
		if err := tx.Create(&features[i]).Error; err != nil {
			tx.Rollback()
			serverError(c, err)
			return
		}
	}
	for i := range useCases {
		useCases[i].ID = 0
		useCases[i].SolutionID = existing.ID
		if err := tx.Create(&useCases[i]).Error; err != nil {
			tx.Rollback()
			serverError(c, err)
			return
		}
	}
	if err := tx.Commit().Error; err != nil {
		serverError(c, err)
		return
	}

	payload.Features = features
	payload.UseCases = useCases
	c.JSON(http.StatusOK, payload)
}

func (h *Handler) AdminDeleteSolution(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}
	if err := h.DB.Delete(&models.Solution{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Solusi berhasil dihapus"})
}

// ---------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------

func (h *Handler) AdminGetProducts(c *gin.Context) {
	var products []models.Product
	err := h.DB.
		Preload("Values", byOrder).
		Preload("Features", byOrder).
		Order(`"order" asc`).
		Find(&products).Error
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, products)
}

func (h *Handler) AdminCreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		badRequest(c, err)
		return
	}
	if strings.TrimSpace(product.Slug) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Slug wajib diisi"})
		return
	}
	product.ID = 0
	if err := h.DB.Create(&product).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusCreated, product)
}

func (h *Handler) AdminUpdateProduct(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}

	var existing models.Product
	if err := h.DB.First(&existing, id).Error; err != nil {
		notFound(c, "Produk tidak ditemukan")
		return
	}

	var payload models.Product
	if err := c.ShouldBindJSON(&payload); err != nil {
		badRequest(c, err)
		return
	}
	payload.ID = existing.ID
	payload.CreatedAt = existing.CreatedAt

	values := payload.Values
	features := payload.Features
	payload.Values = nil
	payload.Features = nil

	tx := h.DB.Begin()
	if err := tx.Save(&payload).Error; err != nil {
		tx.Rollback()
		serverError(c, err)
		return
	}
	if err := tx.Where("product_id = ?", existing.ID).Delete(&models.ProductValue{}).Error; err != nil {
		tx.Rollback()
		serverError(c, err)
		return
	}
	if err := tx.Where("product_id = ?", existing.ID).Delete(&models.ProductFeature{}).Error; err != nil {
		tx.Rollback()
		serverError(c, err)
		return
	}
	for i := range values {
		values[i].ID = 0
		values[i].ProductID = existing.ID
		if err := tx.Create(&values[i]).Error; err != nil {
			tx.Rollback()
			serverError(c, err)
			return
		}
	}
	for i := range features {
		features[i].ID = 0
		features[i].ProductID = existing.ID
		if err := tx.Create(&features[i]).Error; err != nil {
			tx.Rollback()
			serverError(c, err)
			return
		}
	}
	if err := tx.Commit().Error; err != nil {
		serverError(c, err)
		return
	}

	payload.Values = values
	payload.Features = features
	c.JSON(http.StatusOK, payload)
}

func (h *Handler) AdminDeleteProduct(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}
	if err := h.DB.Delete(&models.Product{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil dihapus"})
}

// ---------------------------------------------------------------
// ARTICLES
// ---------------------------------------------------------------

func (h *Handler) AdminGetArticles(c *gin.Context) {
	var articles []models.Article
	if err := h.DB.Preload("Category").Order("created_at desc").Find(&articles).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, articles)
}

func (h *Handler) AdminCreateArticle(c *gin.Context) {
	var article models.Article
	if err := c.ShouldBindJSON(&article); err != nil {
		badRequest(c, err)
		return
	}
	if strings.TrimSpace(article.Slug) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Slug wajib diisi"})
		return
	}

	article.ID = 0
	article.Category = nil
	article.Views = 0
	if article.Status == "" {
		article.Status = "draft"
	}
	if article.Status == "published" && article.PublishedAt.IsZero() {
		article.PublishedAt = models.NewDateOnly(time.Now())
	}

	if err := h.DB.Create(&article).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusCreated, article)
}

func (h *Handler) AdminUpdateArticle(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}

	var existing models.Article
	if err := h.DB.First(&existing, id).Error; err != nil {
		notFound(c, "Artikel tidak ditemukan")
		return
	}

	var payload models.Article
	if err := c.ShouldBindJSON(&payload); err != nil {
		badRequest(c, err)
		return
	}

	payload.ID = existing.ID
	payload.CreatedAt = existing.CreatedAt
	payload.Views = existing.Views
	payload.Category = nil
	if payload.Status == "published" && payload.PublishedAt.IsZero() {
		payload.PublishedAt = models.NewDateOnly(time.Now())
	}

	if err := h.DB.Save(&payload).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, payload)
}

func (h *Handler) AdminDeleteArticle(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}
	if err := h.DB.Delete(&models.Article{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Artikel berhasil dihapus"})
}

// ---------------------------------------------------------------
// INQUIRIES
// ---------------------------------------------------------------

func (h *Handler) AdminGetInquiries(c *gin.Context) {
	var messages []models.ContactMessage
	if err := h.DB.Order("created_at desc").Find(&messages).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, messages)
}

func (h *Handler) AdminUpdateInquiryStatus(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}

	var body struct {
		Status string `json:"status" binding:"required,oneof=new read archived"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		badRequest(c, err)
		return
	}

	if err := h.DB.Model(&models.ContactMessage{}).
		Where("id = ?", id).
		Update("status", body.Status).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Status inquiry berhasil diperbarui"})
}

func (h *Handler) AdminDeleteInquiry(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}
	if err := h.DB.Delete(&models.ContactMessage{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Inquiry berhasil dihapus"})
}

// ---------------------------------------------------------------
// SIMPLE ORDERED COLLECTIONS
// ---------------------------------------------------------------

func (h *Handler) AdminGetPartners(c *gin.Context) {
	var items []models.Partner
	h.DB.Order(`"order" asc`).Find(&items)
	c.JSON(http.StatusOK, items)
}

func (h *Handler) AdminCreatePartner(c *gin.Context) {
	var item models.Partner
	if err := c.ShouldBindJSON(&item); err != nil {
		badRequest(c, err)
		return
	}
	item.ID = 0
	if err := h.DB.Create(&item).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusCreated, item)
}

func (h *Handler) AdminUpdatePartner(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}
	var existing models.Partner
	if err := h.DB.First(&existing, id).Error; err != nil {
		notFound(c, "Partner tidak ditemukan")
		return
	}
	var payload models.Partner
	if err := c.ShouldBindJSON(&payload); err != nil {
		badRequest(c, err)
		return
	}
	payload.ID = existing.ID
	if err := h.DB.Save(&payload).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, payload)
}

func (h *Handler) AdminDeletePartner(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}
	if err := h.DB.Delete(&models.Partner{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Partner berhasil dihapus"})
}

func (h *Handler) AdminGetValueProps(c *gin.Context) {
	var items []models.ValueProp
	h.DB.Order(`"order" asc`).Find(&items)
	c.JSON(http.StatusOK, items)
}

func (h *Handler) AdminUpsertValueProp(c *gin.Context) {
	var item models.ValueProp
	if err := c.ShouldBindJSON(&item); err != nil {
		badRequest(c, err)
		return
	}
	if err := h.DB.Save(&item).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *Handler) AdminDeleteValueProp(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}
	if err := h.DB.Delete(&models.ValueProp{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Value prop berhasil dihapus"})
}

func (h *Handler) AdminGetApproachSteps(c *gin.Context) {
	var items []models.ApproachStep
	h.DB.Order(`"order" asc`).Find(&items)
	c.JSON(http.StatusOK, items)
}

func (h *Handler) AdminUpsertApproachStep(c *gin.Context) {
	var item models.ApproachStep
	if err := c.ShouldBindJSON(&item); err != nil {
		badRequest(c, err)
		return
	}
	if err := h.DB.Save(&item).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *Handler) AdminDeleteApproachStep(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}
	if err := h.DB.Delete(&models.ApproachStep{}, id).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Langkah berhasil dihapus"})
}

func (h *Handler) AdminGetCategories(c *gin.Context) {
	var items []models.ArticleCategory
	h.DB.Order(`"order" asc`).Find(&items)
	c.JSON(http.StatusOK, items)
}

func (h *Handler) AdminUpsertCategory(c *gin.Context) {
	var item models.ArticleCategory
	if err := c.ShouldBindJSON(&item); err != nil {
		badRequest(c, err)
		return
	}
	if strings.TrimSpace(item.Slug) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Slug wajib diisi"})
		return
	}
	if err := h.DB.Save(&item).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

// ---------------------------------------------------------------
// PAGE SECTIONS / SETTINGS / LEGAL
// ---------------------------------------------------------------

func (h *Handler) AdminGetSections(c *gin.Context) {
	var items []models.PageSection
	h.DB.Order("key asc").Find(&items)
	c.JSON(http.StatusOK, items)
}

func (h *Handler) AdminUpsertSection(c *gin.Context) {
	var payload models.PageSection
	if err := c.ShouldBindJSON(&payload); err != nil {
		badRequest(c, err)
		return
	}
	if strings.TrimSpace(payload.Key) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Key wajib diisi"})
		return
	}

	var existing models.PageSection
	if err := h.DB.Where("key = ?", payload.Key).First(&existing).Error; err == nil {
		payload.ID = existing.ID
	} else {
		payload.ID = 0
	}
	payload.UpdatedAt = time.Now()

	if err := h.DB.Save(&payload).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, payload)
}

func (h *Handler) AdminGetSettings(c *gin.Context) {
	var items []models.SiteSetting
	h.DB.Order("key asc").Find(&items)
	c.JSON(http.StatusOK, items)
}

func (h *Handler) AdminUpsertSettings(c *gin.Context) {
	var payload []models.SiteSetting
	if err := c.ShouldBindJSON(&payload); err != nil {
		badRequest(c, err)
		return
	}

	tx := h.DB.Begin()
	for _, s := range payload {
		if strings.TrimSpace(s.Key) == "" {
			continue
		}
		var existing models.SiteSetting
		if err := tx.Where("key = ?", s.Key).First(&existing).Error; err == nil {
			s.ID = existing.ID
		} else {
			s.ID = 0
		}
		if err := tx.Save(&s).Error; err != nil {
			tx.Rollback()
			serverError(c, err)
			return
		}
	}
	if err := tx.Commit().Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pengaturan berhasil disimpan"})
}

func (h *Handler) AdminGetLegalPages(c *gin.Context) {
	var items []models.LegalPage
	h.DB.Order("slug asc").Find(&items)
	c.JSON(http.StatusOK, items)
}

func (h *Handler) AdminUpsertLegalPage(c *gin.Context) {
	var payload models.LegalPage
	if err := c.ShouldBindJSON(&payload); err != nil {
		badRequest(c, err)
		return
	}
	if strings.TrimSpace(payload.Slug) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Slug wajib diisi"})
		return
	}

	var existing models.LegalPage
	if err := h.DB.Where("slug = ?", payload.Slug).First(&existing).Error; err == nil {
		payload.ID = existing.ID
	} else {
		payload.ID = 0
	}
	payload.UpdatedAt = time.Now()

	if err := h.DB.Save(&payload).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, payload)
}
