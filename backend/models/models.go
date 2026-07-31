package models

import (
	"time"
)

// LocaleEN and LocaleID are the two supported content locales.
const (
	LocaleID = "id"
	LocaleEN = "en"
)

// NormalizeLocale maps an arbitrary query value to a supported locale,
// defaulting to Indonesian.
func NormalizeLocale(raw string) string {
	if raw == LocaleEN {
		return LocaleEN
	}
	return LocaleID
}

// pick returns the localized value, falling back to the Indonesian copy
// when the English translation has not been filled in yet.
func pick(valueID, valueEN, locale string) string {
	if locale == LocaleEN && valueEN != "" {
		return valueEN
	}
	if valueID != "" {
		return valueID
	}
	return valueEN
}

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Role      string    `gorm:"default:'editor'" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Partner is a client/partner logo shown in the homepage marquee.
type Partner struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	Name    string `gorm:"not null" json:"name"`
	LogoURL string `json:"logo_url"`
	Website string `json:"website"`
	Order   int    `gorm:"default:0" json:"order"`
	Active  bool   `gorm:"default:true" json:"active"`
}

// ValueProp is one of the "why choose us" cards on the homepage.
type ValueProp struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	IconURL string `json:"icon_url"`
	TitleID string `json:"title_id"`
	TitleEN string `json:"title_en"`
	DescID  string `json:"desc_id"`
	DescEN  string `json:"desc_en"`
	Order   int    `gorm:"default:0" json:"order"`
}

// Solution is a top-level service line with its own landing page.
type Solution struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Slug string `gorm:"uniqueIndex;not null" json:"slug"`

	NameID    string `json:"name_id"`
	NameEN    string `json:"name_en"`
	EyebrowID string `json:"eyebrow_id"`
	EyebrowEN string `json:"eyebrow_en"`
	TitleID   string `json:"title_id"`
	TitleEN   string `json:"title_en"`
	DescID    string `gorm:"type:text" json:"desc_id"`
	DescEN    string `gorm:"type:text" json:"desc_en"`
	SummaryID string `gorm:"type:text" json:"summary_id"`
	SummaryEN string `gorm:"type:text" json:"summary_en"`

	IconURL      string `json:"icon_url"`
	CardImageURL string `json:"card_image_url"`
	HeroImageURL string `json:"hero_image_url"`

	CtaLabelID string `json:"cta_label_id"`
	CtaLabelEN string `json:"cta_label_en"`
	CtaHref    string `json:"cta_href"`

	FeatureTitleID string `json:"feature_title_id"`
	FeatureTitleEN string `json:"feature_title_en"`

	CapabilityTitleID string `json:"capability_title_id"`
	CapabilityTitleEN string `json:"capability_title_en"`
	CapabilityImage   string `json:"capability_image"`

	CtaTitleID string `json:"cta_title_id"`
	CtaTitleEN string `json:"cta_title_en"`
	CtaBanner  string `json:"cta_banner"`

	Order     int  `gorm:"default:0" json:"order"`
	Published bool `gorm:"default:true" json:"published"`

	Features []SolutionFeature `gorm:"constraint:OnDelete:CASCADE" json:"features"`
	UseCases []SolutionUseCase `gorm:"constraint:OnDelete:CASCADE" json:"use_cases"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// SolutionFeature is a sub-solution block rendered in the sticky scroll section.
type SolutionFeature struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	SolutionID uint   `gorm:"index" json:"solution_id"`
	LabelID    string `json:"label_id"`
	LabelEN    string `json:"label_en"`
	TitleID    string `json:"title_id"`
	TitleEN    string `json:"title_en"`
	DescID     string `gorm:"type:text" json:"desc_id"`
	DescEN     string `gorm:"type:text" json:"desc_en"`
	ImageURL   string `json:"image_url"`
	Order      int    `gorm:"default:0" json:"order"`
}

// SolutionUseCase is one capability bullet in the solution capability grid.
type SolutionUseCase struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	SolutionID uint   `gorm:"index" json:"solution_id"`
	TitleID    string `json:"title_id"`
	TitleEN    string `json:"title_en"`
	DescID     string `gorm:"type:text" json:"desc_id"`
	DescEN     string `gorm:"type:text" json:"desc_en"`
	Order      int    `gorm:"default:0" json:"order"`
}

// Product is a flagship named product with a dedicated marketing page.
type Product struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Slug string `gorm:"uniqueIndex;not null" json:"slug"`

	NameID    string `json:"name_id"`
	NameEN    string `json:"name_en"`
	TitleID   string `json:"title_id"`
	TitleEN   string `json:"title_en"`
	TaglineID string `gorm:"type:text" json:"tagline_id"`
	TaglineEN string `gorm:"type:text" json:"tagline_en"`

	LogoURL      string `json:"logo_url"`
	HeroImageURL string `json:"hero_image_url"`

	// Newline separated marquee chips shown under the hero.
	PromptsID string `gorm:"type:text" json:"prompts_id"`
	PromptsEN string `gorm:"type:text" json:"prompts_en"`

	AcronymTitleID string `json:"acronym_title_id"`
	AcronymTitleEN string `json:"acronym_title_en"`

	CtaTitleID string `json:"cta_title_id"`
	CtaTitleEN string `json:"cta_title_en"`
	CtaLabelID string `json:"cta_label_id"`
	CtaLabelEN string `json:"cta_label_en"`
	CtaHref    string `json:"cta_href"`

	Order     int  `gorm:"default:0" json:"order"`
	Published bool `gorm:"default:true" json:"published"`

	Values   []ProductValue   `gorm:"constraint:OnDelete:CASCADE" json:"values"`
	Features []ProductFeature `gorm:"constraint:OnDelete:CASCADE" json:"features"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ProductValue is one letter of the product acronym.
type ProductValue struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ProductID uint   `gorm:"index" json:"product_id"`
	Letter    string `json:"letter"`
	TitleID   string `json:"title_id"`
	TitleEN   string `json:"title_en"`
	DescID    string `gorm:"type:text" json:"desc_id"`
	DescEN    string `gorm:"type:text" json:"desc_en"`
	ImageURL  string `json:"image_url"`
	Order     int    `gorm:"default:0" json:"order"`
}

// ProductFeature is a large alternating image + copy block.
type ProductFeature struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ProductID uint   `gorm:"index" json:"product_id"`
	TitleID   string `json:"title_id"`
	TitleEN   string `json:"title_en"`
	DescID    string `gorm:"type:text" json:"desc_id"`
	DescEN    string `gorm:"type:text" json:"desc_en"`
	ImageURL  string `json:"image_url"`
	Order     int    `gorm:"default:0" json:"order"`
}

// ArticleCategory groups articles into the news filter tabs.
type ArticleCategory struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Slug   string `gorm:"uniqueIndex;not null" json:"slug"`
	NameID string `json:"name_id"`
	NameEN string `json:"name_en"`
	Order  int    `gorm:"default:0" json:"order"`
}

type Article struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	Slug       string `gorm:"uniqueIndex;not null" json:"slug"`
	CategoryID uint   `gorm:"index" json:"category_id"`

	TitleID   string `json:"title_id"`
	TitleEN   string `json:"title_en"`
	ExcerptID string `gorm:"type:text" json:"excerpt_id"`
	ExcerptEN string `gorm:"type:text" json:"excerpt_en"`
	ContentID string `gorm:"type:text" json:"content_id"`
	ContentEN string `gorm:"type:text" json:"content_en"`

	ImageURL string `json:"image_url"`
	Author   string `json:"author"`
	Status   string `gorm:"default:'draft';index" json:"status"` // draft, published
	Featured bool   `gorm:"default:false" json:"featured"`
	Views    int    `gorm:"default:0" json:"views"`
	ReadTime string `json:"read_time"`

	Category *ArticleCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`

	PublishedAt DateOnly  `json:"published_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ApproachStep is a numbered step in the "our approach" section.
type ApproachStep struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Number   string `json:"number"`
	TitleID  string `json:"title_id"`
	TitleEN  string `json:"title_en"`
	DescID   string `gorm:"type:text" json:"desc_id"`
	DescEN   string `gorm:"type:text" json:"desc_en"`
	ImageURL string `json:"image_url"`
	Order    int    `gorm:"default:0" json:"order"`
}

// PageSection holds editable copy for a named section of a static page.
type PageSection struct {
	ID  uint   `gorm:"primaryKey" json:"id"`
	Key string `gorm:"uniqueIndex;not null" json:"key"`

	EyebrowID  string `json:"eyebrow_id"`
	EyebrowEN  string `json:"eyebrow_en"`
	TitleID    string `gorm:"type:text" json:"title_id"`
	TitleEN    string `gorm:"type:text" json:"title_en"`
	SubtitleID string `gorm:"type:text" json:"subtitle_id"`
	SubtitleEN string `gorm:"type:text" json:"subtitle_en"`
	DescID     string `gorm:"type:text" json:"desc_id"`
	DescEN     string `gorm:"type:text" json:"desc_en"`

	ImageURL       string `json:"image_url"`
	ImageMobileURL string `json:"image_mobile_url"`

	CtaLabelID string `json:"cta_label_id"`
	CtaLabelEN string `json:"cta_label_en"`
	CtaHref    string `json:"cta_href"`

	UpdatedAt time.Time `json:"updated_at"`
}

// SiteSetting is a global scalar configuration value.
type SiteSetting struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	Key     string `gorm:"uniqueIndex;not null" json:"key"`
	ValueID string `gorm:"type:text" json:"value_id"`
	ValueEN string `gorm:"type:text" json:"value_en"`
}

// LegalPage is a long-form legal document (privacy policy, terms).
type LegalPage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Slug      string    `gorm:"uniqueIndex;not null" json:"slug"`
	TitleID   string    `json:"title_id"`
	TitleEN   string    `json:"title_en"`
	BodyID    string    `gorm:"type:text" json:"body_id"`
	BodyEN    string    `gorm:"type:text" json:"body_en"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ContactMessage struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	Name             string    `gorm:"not null" json:"name"`
	Email            string    `gorm:"not null" json:"email"`
	Company          string    `json:"company"`
	Phone            string    `json:"phone"`
	SolutionInterest string    `json:"solution_interest"`
	Message          string    `gorm:"not null" json:"message"`
	Locale           string    `gorm:"default:'id'" json:"locale"`
	Status           string    `gorm:"default:'new';index" json:"status"` // new, read, archived
	CreatedAt        time.Time `json:"created_at"`
}

// MediaAsset tracks uploaded files so the admin can browse them.
type MediaAsset struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	FileName     string    `gorm:"not null" json:"file_name"`
	OriginalName string    `json:"original_name"`
	URL          string    `gorm:"not null" json:"url"`
	MimeType     string    `json:"mime_type"`
	SizeBytes    int64     `json:"size_bytes"`
	UploadedBy   uint      `json:"uploaded_by"`
	CreatedAt    time.Time `json:"created_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type ContactRequest struct {
	Name             string `json:"name" binding:"required,min=2,max=120"`
	Email            string `json:"email" binding:"required,email,max=180"`
	Company          string `json:"company" binding:"max=180"`
	Phone            string `json:"phone" binding:"max=40"`
	SolutionInterest string `json:"solution_interest" binding:"max=120"`
	Message          string `json:"message" binding:"required,min=10,max=4000"`
	Locale           string `json:"locale" binding:"max=5"`
	// Honeypot: must stay empty. Bots that fill every input get rejected.
	Website string `json:"website" binding:"max=200"`
}
