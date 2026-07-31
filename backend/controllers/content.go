package controllers

import (
	"net/http"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetPartners(c *gin.Context) {
	var partners []models.Partner
	if err := h.DB.Where("active = ?", true).Order(`"order" asc`).Find(&partners).Error; err != nil {
		serverError(c, err)
		return
	}

	out := make([]models.PartnerView, 0, len(partners))
	for _, p := range partners {
		out = append(out, p.Localize(""))
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) GetValueProps(c *gin.Context) {
	loc := locale(c)

	var items []models.ValueProp
	if err := h.DB.Order(`"order" asc`).Find(&items).Error; err != nil {
		serverError(c, err)
		return
	}

	out := make([]models.ValuePropView, 0, len(items))
	for _, v := range items {
		out = append(out, v.Localize(loc))
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) GetApproachSteps(c *gin.Context) {
	loc := locale(c)

	var steps []models.ApproachStep
	if err := h.DB.Order(`"order" asc`).Find(&steps).Error; err != nil {
		serverError(c, err)
		return
	}

	out := make([]models.ApproachStepView, 0, len(steps))
	for _, s := range steps {
		out = append(out, s.Localize(loc))
	}
	c.JSON(http.StatusOK, out)
}

// GetSections returns every editable page section keyed by its section key,
// so a page can pull all of its copy in a single request.
func (h *Handler) GetSections(c *gin.Context) {
	loc := locale(c)

	var sections []models.PageSection
	if err := h.DB.Find(&sections).Error; err != nil {
		serverError(c, err)
		return
	}

	out := make(map[string]models.PageSectionView, len(sections))
	for _, s := range sections {
		out[s.Key] = s.Localize(loc)
	}
	c.JSON(http.StatusOK, out)
}

// GetSettings returns global scalar settings as a flat key/value map.
func (h *Handler) GetSettings(c *gin.Context) {
	loc := locale(c)

	var settings []models.SiteSetting
	if err := h.DB.Find(&settings).Error; err != nil {
		serverError(c, err)
		return
	}

	out := make(map[string]string, len(settings))
	for _, s := range settings {
		if loc == models.LocaleEN && s.ValueEN != "" {
			out[s.Key] = s.ValueEN
			continue
		}
		if s.ValueID != "" {
			out[s.Key] = s.ValueID
		} else {
			out[s.Key] = s.ValueEN
		}
	}
	c.JSON(http.StatusOK, out)
}

func (h *Handler) GetLegalPage(c *gin.Context) {
	loc := locale(c)

	var page models.LegalPage
	if err := h.DB.Where("slug = ?", c.Param("slug")).First(&page).Error; err != nil {
		notFound(c, "Halaman tidak ditemukan")
		return
	}
	c.JSON(http.StatusOK, page.Localize(loc))
}
