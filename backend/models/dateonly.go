package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// DateOnly wraps time.Time so JSON round-trips use the plain "2006-01-02" form
// that date inputs in the admin panel produce, while still accepting a full
// RFC3339 timestamp from any older client.
type DateOnly struct {
	time.Time
}

const dateLayout = "2006-01-02"

// NewDateOnly is a small helper for seeds and tests.
func NewDateOnly(t time.Time) DateOnly {
	return DateOnly{Time: t}
}

func (d DateOnly) MarshalJSON() ([]byte, error) {
	if d.IsZero() {
		return []byte(`""`), nil
	}
	return json.Marshal(d.Format(dateLayout))
}

func (d *DateOnly) UnmarshalJSON(data []byte) error {
	raw := strings.Trim(strings.TrimSpace(string(data)), `"`)
	if raw == "" || raw == "null" {
		d.Time = time.Time{}
		return nil
	}

	// Try the full timestamp first, then fall back to the date-only form.
	if parsed, err := time.Parse(time.RFC3339, raw); err == nil {
		d.Time = parsed
		return nil
	}

	parsed, err := time.Parse(dateLayout, raw)
	if err != nil {
		return fmt.Errorf("tanggal harus berformat YYYY-MM-DD: %w", err)
	}
	d.Time = parsed
	return nil
}

// Value and Scan let GORM persist the wrapper as an ordinary timestamp column.
func (d DateOnly) Value() (driver.Value, error) {
	if d.IsZero() {
		return nil, nil
	}
	return d.Time, nil
}

func (d *DateOnly) Scan(value any) error {
	switch v := value.(type) {
	case nil:
		d.Time = time.Time{}
	case time.Time:
		d.Time = v
	case []byte:
		return d.UnmarshalJSON(append(append([]byte(`"`), v...), '"'))
	case string:
		return d.UnmarshalJSON([]byte(`"` + v + `"`))
	default:
		return fmt.Errorf("tidak dapat membaca tanggal dari %T", value)
	}
	return nil
}
