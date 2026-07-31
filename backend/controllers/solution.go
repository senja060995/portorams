package controllers

import (
	"net/http"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// byOrder is a reusable preload scope for child rows that carry an "order" column.
func byOrder(db *gorm.DB) *gorm.DB {
	return db.Order(`"order" asc`)
}

func (h *Handler) GetSolutions(c *gin.Context) {
	loc := locale(c)

	var solutions []models.Solution
	if err := h.DB.
		Where("published = ?", true).
		Order(`"order" asc`).
		Find(&solutions).Error; err != nil {
		serverError(c, err)
		return
	}

	out := make([]models.SolutionView, 0, len(solutions))
	for _, s := range solutions {
		out = append(out, s.Localize(loc))
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) GetSolutionBySlug(c *gin.Context) {
	loc := locale(c)

	var solution models.Solution
	err := h.DB.
		Preload("Features", byOrder).
		Preload("UseCases", byOrder).
		Where("slug = ? AND published = ?", c.Param("slug"), true).
		First(&solution).Error
	if err != nil {
		notFound(c, "Solusi tidak ditemukan")
		return
	}

	c.JSON(http.StatusOK, solution.Localize(loc))
}

func (h *Handler) GetProducts(c *gin.Context) {
	loc := locale(c)

	var products []models.Product
	if err := h.DB.
		Where("published = ?", true).
		Order(`"order" asc`).
		Find(&products).Error; err != nil {
		serverError(c, err)
		return
	}

	out := make([]models.ProductView, 0, len(products))
	for _, p := range products {
		out = append(out, p.Localize(loc))
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) GetProductBySlug(c *gin.Context) {
	loc := locale(c)

	var product models.Product
	err := h.DB.
		Preload("Values", byOrder).
		Preload("Features", byOrder).
		Where("slug = ? AND published = ?", c.Param("slug"), true).
		First(&product).Error
	if err != nil {
		notFound(c, "Produk tidak ditemukan")
		return
	}

	c.JSON(http.StatusOK, product.Localize(loc))
}
