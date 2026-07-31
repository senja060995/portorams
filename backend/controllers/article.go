package controllers

import (
	"net/http"
	"strconv"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	defaultPageSize = 6
	maxPageSize     = 48
)

func (h *Handler) GetArticleCategories(c *gin.Context) {
	loc := locale(c)

	var categories []models.ArticleCategory
	if err := h.DB.Order(`"order" asc`).Find(&categories).Error; err != nil {
		serverError(c, err)
		return
	}

	out := make([]models.ArticleCategoryView, 0, len(categories))
	for _, cat := range categories {
		out = append(out, cat.Localize(loc))
	}
	c.JSON(http.StatusOK, out)
}

// GetArticles returns a paginated list of published articles, newest first.
// Supports ?category=<slug>, ?featured=true, ?page= and ?limit=.
func (h *Handler) GetArticles(c *gin.Context) {
	loc := locale(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(defaultPageSize)))
	if limit < 1 {
		limit = defaultPageSize
	}
	if limit > maxPageSize {
		limit = maxPageSize
	}

	query := h.DB.Model(&models.Article{}).Where("articles.status = ?", "published")

	if slug := c.Query("category"); slug != "" && slug != "all" {
		query = query.
			Joins("JOIN article_categories ON article_categories.id = articles.category_id").
			Where("article_categories.slug = ?", slug)
	}
	if c.Query("featured") == "true" {
		query = query.Where("articles.featured = ?", true)
	}
	if exclude := c.Query("exclude"); exclude != "" {
		query = query.Where("articles.slug <> ?", exclude)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		serverError(c, err)
		return
	}

	var articles []models.Article
	err := query.
		Preload("Category").
		Order("articles.published_at desc").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&articles).Error
	if err != nil {
		serverError(c, err)
		return
	}

	items := make([]models.ArticleView, 0, len(articles))
	for _, a := range articles {
		items = append(items, a.LocalizeSummary(loc))
	}

	c.JSON(http.StatusOK, gin.H{
		"items":    items,
		"total":    total,
		"page":     page,
		"limit":    limit,
		"has_more": int64(page*limit) < total,
	})
}

func (h *Handler) GetArticleBySlug(c *gin.Context) {
	loc := locale(c)

	var article models.Article
	err := h.DB.
		Preload("Category").
		Where("slug = ? AND status = ?", c.Param("slug"), "published").
		First(&article).Error
	if err != nil {
		notFound(c, "Artikel tidak ditemukan")
		return
	}

	// Fire-and-forget view counter; a failure here must not break the response.
	h.DB.Model(&models.Article{}).
		Where("id = ?", article.ID).
		UpdateColumn("views", gorm.Expr("views + ?", 1))

	c.JSON(http.StatusOK, article.Localize(loc))
}
