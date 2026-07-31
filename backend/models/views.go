package models

import "strings"

// This file converts bilingual database rows into flat, single-locale payloads
// so the frontend never has to know about the *_id / *_en column pairs.

type PartnerView struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	LogoURL string `json:"logo_url"`
	Website string `json:"website"`
}

func (p Partner) Localize(string) PartnerView {
	return PartnerView{ID: p.ID, Name: p.Name, LogoURL: p.LogoURL, Website: p.Website}
}

type ValuePropView struct {
	ID      uint   `json:"id"`
	IconURL string `json:"icon_url"`
	Title   string `json:"title"`
	Desc    string `json:"desc"`
}

func (v ValueProp) Localize(locale string) ValuePropView {
	return ValuePropView{
		ID:      v.ID,
		IconURL: v.IconURL,
		Title:   pick(v.TitleID, v.TitleEN, locale),
		Desc:    pick(v.DescID, v.DescEN, locale),
	}
}

type SolutionFeatureView struct {
	ID       uint   `json:"id"`
	Label    string `json:"label"`
	Title    string `json:"title"`
	Desc     string `json:"desc"`
	ImageURL string `json:"image_url"`
}

func (f SolutionFeature) Localize(locale string) SolutionFeatureView {
	return SolutionFeatureView{
		ID:       f.ID,
		Label:    pick(f.LabelID, f.LabelEN, locale),
		Title:    pick(f.TitleID, f.TitleEN, locale),
		Desc:     pick(f.DescID, f.DescEN, locale),
		ImageURL: f.ImageURL,
	}
}

type SolutionUseCaseView struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
	Desc  string `json:"desc"`
}

func (u SolutionUseCase) Localize(locale string) SolutionUseCaseView {
	return SolutionUseCaseView{
		ID:    u.ID,
		Title: pick(u.TitleID, u.TitleEN, locale),
		Desc:  pick(u.DescID, u.DescEN, locale),
	}
}

type SolutionView struct {
	ID      uint   `json:"id"`
	Slug    string `json:"slug"`
	Name    string `json:"name"`
	Eyebrow string `json:"eyebrow"`
	Title   string `json:"title"`
	Desc    string `json:"desc"`
	Summary string `json:"summary"`

	IconURL      string `json:"icon_url"`
	CardImageURL string `json:"card_image_url"`
	HeroImageURL string `json:"hero_image_url"`

	CtaLabel string `json:"cta_label"`
	CtaHref  string `json:"cta_href"`

	FeatureTitle string `json:"feature_title"`

	CapabilityTitle string `json:"capability_title"`
	CapabilityImage string `json:"capability_image"`

	CtaTitle  string `json:"cta_title"`
	CtaBanner string `json:"cta_banner"`

	Features []SolutionFeatureView `json:"features"`
	UseCases []SolutionUseCaseView `json:"use_cases"`
}

func (s Solution) Localize(locale string) SolutionView {
	v := SolutionView{
		ID:              s.ID,
		Slug:            s.Slug,
		Name:            pick(s.NameID, s.NameEN, locale),
		Eyebrow:         pick(s.EyebrowID, s.EyebrowEN, locale),
		Title:           pick(s.TitleID, s.TitleEN, locale),
		Desc:            pick(s.DescID, s.DescEN, locale),
		Summary:         pick(s.SummaryID, s.SummaryEN, locale),
		IconURL:         s.IconURL,
		CardImageURL:    s.CardImageURL,
		HeroImageURL:    s.HeroImageURL,
		CtaLabel:        pick(s.CtaLabelID, s.CtaLabelEN, locale),
		CtaHref:         s.CtaHref,
		FeatureTitle:    pick(s.FeatureTitleID, s.FeatureTitleEN, locale),
		CapabilityTitle: pick(s.CapabilityTitleID, s.CapabilityTitleEN, locale),
		CapabilityImage: s.CapabilityImage,
		CtaTitle:        pick(s.CtaTitleID, s.CtaTitleEN, locale),
		CtaBanner:       s.CtaBanner,
		Features:        make([]SolutionFeatureView, 0, len(s.Features)),
		UseCases:        make([]SolutionUseCaseView, 0, len(s.UseCases)),
	}
	for _, f := range s.Features {
		v.Features = append(v.Features, f.Localize(locale))
	}
	for _, u := range s.UseCases {
		v.UseCases = append(v.UseCases, u.Localize(locale))
	}
	return v
}

type ProductValueView struct {
	ID       uint   `json:"id"`
	Letter   string `json:"letter"`
	Title    string `json:"title"`
	Desc     string `json:"desc"`
	ImageURL string `json:"image_url"`
}

func (p ProductValue) Localize(locale string) ProductValueView {
	return ProductValueView{
		ID:       p.ID,
		Letter:   p.Letter,
		Title:    pick(p.TitleID, p.TitleEN, locale),
		Desc:     pick(p.DescID, p.DescEN, locale),
		ImageURL: p.ImageURL,
	}
}

type ProductFeatureView struct {
	ID       uint   `json:"id"`
	Title    string `json:"title"`
	Desc     string `json:"desc"`
	ImageURL string `json:"image_url"`
}

func (p ProductFeature) Localize(locale string) ProductFeatureView {
	return ProductFeatureView{
		ID:       p.ID,
		Title:    pick(p.TitleID, p.TitleEN, locale),
		Desc:     pick(p.DescID, p.DescEN, locale),
		ImageURL: p.ImageURL,
	}
}

type ProductView struct {
	ID      uint   `json:"id"`
	Slug    string `json:"slug"`
	Name    string `json:"name"`
	Title   string `json:"title"`
	Tagline string `json:"tagline"`

	LogoURL      string `json:"logo_url"`
	HeroImageURL string `json:"hero_image_url"`

	Prompts []string `json:"prompts"`

	AcronymTitle string `json:"acronym_title"`
	CtaTitle     string `json:"cta_title"`
	CtaLabel     string `json:"cta_label"`
	CtaHref      string `json:"cta_href"`

	Values   []ProductValueView   `json:"values"`
	Features []ProductFeatureView `json:"features"`
}

func (p Product) Localize(locale string) ProductView {
	v := ProductView{
		ID:           p.ID,
		Slug:         p.Slug,
		Name:         pick(p.NameID, p.NameEN, locale),
		Title:        pick(p.TitleID, p.TitleEN, locale),
		Tagline:      pick(p.TaglineID, p.TaglineEN, locale),
		LogoURL:      p.LogoURL,
		HeroImageURL: p.HeroImageURL,
		Prompts:      splitLines(pick(p.PromptsID, p.PromptsEN, locale)),
		AcronymTitle: pick(p.AcronymTitleID, p.AcronymTitleEN, locale),
		CtaTitle:     pick(p.CtaTitleID, p.CtaTitleEN, locale),
		CtaLabel:     pick(p.CtaLabelID, p.CtaLabelEN, locale),
		CtaHref:      p.CtaHref,
		Values:       make([]ProductValueView, 0, len(p.Values)),
		Features:     make([]ProductFeatureView, 0, len(p.Features)),
	}
	for _, val := range p.Values {
		v.Values = append(v.Values, val.Localize(locale))
	}
	for _, f := range p.Features {
		v.Features = append(v.Features, f.Localize(locale))
	}
	return v
}

type ArticleCategoryView struct {
	ID   uint   `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

func (c ArticleCategory) Localize(locale string) ArticleCategoryView {
	return ArticleCategoryView{
		ID:   c.ID,
		Slug: c.Slug,
		Name: pick(c.NameID, c.NameEN, locale),
	}
}

type ArticleView struct {
	ID       uint   `json:"id"`
	Slug     string `json:"slug"`
	Title    string `json:"title"`
	Excerpt  string `json:"excerpt"`
	Content  string `json:"content,omitempty"`
	ImageURL string `json:"image_url"`
	Author   string `json:"author"`
	Featured bool   `json:"featured"`
	Views    int    `json:"views"`
	ReadTime string `json:"read_time"`

	CategorySlug string `json:"category_slug"`
	CategoryName string `json:"category_name"`

	PublishedAt string `json:"published_at"`
}

// LocalizeSummary omits the article body, for list/card contexts.
func (a Article) LocalizeSummary(locale string) ArticleView {
	v := a.localize(locale)
	v.Content = ""
	return v
}

func (a Article) Localize(locale string) ArticleView {
	return a.localize(locale)
}

func (a Article) localize(locale string) ArticleView {
	v := ArticleView{
		ID:          a.ID,
		Slug:        a.Slug,
		Title:       pick(a.TitleID, a.TitleEN, locale),
		Excerpt:     pick(a.ExcerptID, a.ExcerptEN, locale),
		Content:     pick(a.ContentID, a.ContentEN, locale),
		ImageURL:    a.ImageURL,
		Author:      a.Author,
		Featured:    a.Featured,
		Views:       a.Views,
		ReadTime:    a.ReadTime,
		PublishedAt: a.PublishedAt.Format("2006-01-02"),
	}
	if a.Category != nil {
		v.CategorySlug = a.Category.Slug
		v.CategoryName = pick(a.Category.NameID, a.Category.NameEN, locale)
	}
	return v
}

type ApproachStepView struct {
	ID       uint   `json:"id"`
	Number   string `json:"number"`
	Title    string `json:"title"`
	Desc     string `json:"desc"`
	ImageURL string `json:"image_url"`
}

func (a ApproachStep) Localize(locale string) ApproachStepView {
	return ApproachStepView{
		ID:       a.ID,
		Number:   a.Number,
		Title:    pick(a.TitleID, a.TitleEN, locale),
		Desc:     pick(a.DescID, a.DescEN, locale),
		ImageURL: a.ImageURL,
	}
}

type PageSectionView struct {
	Key            string `json:"key"`
	Eyebrow        string `json:"eyebrow"`
	Title          string `json:"title"`
	Subtitle       string `json:"subtitle"`
	Desc           string `json:"desc"`
	ImageURL       string `json:"image_url"`
	ImageMobileURL string `json:"image_mobile_url"`
	CtaLabel       string `json:"cta_label"`
	CtaHref        string `json:"cta_href"`
}

func (p PageSection) Localize(locale string) PageSectionView {
	return PageSectionView{
		Key:            p.Key,
		Eyebrow:        pick(p.EyebrowID, p.EyebrowEN, locale),
		Title:          pick(p.TitleID, p.TitleEN, locale),
		Subtitle:       pick(p.SubtitleID, p.SubtitleEN, locale),
		Desc:           pick(p.DescID, p.DescEN, locale),
		ImageURL:       p.ImageURL,
		ImageMobileURL: p.ImageMobileURL,
		CtaLabel:       pick(p.CtaLabelID, p.CtaLabelEN, locale),
		CtaHref:        p.CtaHref,
	}
}

type LegalPageView struct {
	Slug      string `json:"slug"`
	Title     string `json:"title"`
	Body      string `json:"body"`
	UpdatedAt string `json:"updated_at"`
}

func (l LegalPage) Localize(locale string) LegalPageView {
	return LegalPageView{
		Slug:      l.Slug,
		Title:     pick(l.TitleID, l.TitleEN, locale),
		Body:      pick(l.BodyID, l.BodyEN, locale),
		UpdatedAt: l.UpdatedAt.Format("2006-01-02"),
	}
}

func splitLines(raw string) []string {
	out := []string{}
	for _, line := range strings.Split(raw, "\n") {
		if trimmed := strings.TrimSpace(line); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
