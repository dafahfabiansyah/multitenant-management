package service

import (
	"gin-quickstart/internal/repository"
	"time"
)

type DashboardService interface {
	GetDashboardStats(tenantID uint, period string) (*DashboardStats, error)
}

type dashboardService struct {
	contactRepo  repository.ContactRepository
	auditLogRepo repository.AuditLogRepository
}

func NewDashboardService(
	contactRepo repository.ContactRepository,
	auditLogRepo repository.AuditLogRepository,
) DashboardService {
	return &dashboardService{
		contactRepo:  contactRepo,
		auditLogRepo: auditLogRepo,
	}
}

type DashboardStats struct {
	TotalContacts    MetricData `json:"total_contacts"`
	RecentActivities MetricData `json:"recent_activities"`
	GrowthRate       float64    `json:"growth_rate"`
}

type MetricData struct {
	Current          int     `json:"current"`
	Previous         int     `json:"previous"`
	GrowthPercentage float64 `json:"growth_percentage"`
}

func (s *dashboardService) GetDashboardStats(tenantID uint, period string) (*DashboardStats, error) {
	// Calculate time ranges based on period
	currentStart, currentEnd, previousStart, previousEnd := s.calculateTimeRanges(period)

	// Get total contacts stats
	totalContacts, err := s.getTotalContactsStats(tenantID, currentStart, currentEnd, previousStart, previousEnd)
	if err != nil {
		return nil, err
	}

	// Get recent activities stats
	recentActivities, err := s.getRecentActivitiesStats(tenantID, currentStart, currentEnd, previousStart, previousEnd)
	if err != nil {
		return nil, err
	}

	// Growth rate is same as contacts growth
	growthRate := totalContacts.GrowthPercentage

	return &DashboardStats{
		TotalContacts:    totalContacts,
		RecentActivities: recentActivities,
		GrowthRate:       growthRate,
	}, nil
}

func (s *dashboardService) calculateTimeRanges(period string) (currentStart, currentEnd, previousStart, previousEnd time.Time) {
	now := time.Now()
	currentEnd = now

	switch period {
	case "week":
		// Current week: last 7 days
		currentStart = now.AddDate(0, 0, -7)
		// Previous week: 14 days ago to 7 days ago
		previousEnd = currentStart
		previousStart = currentStart.AddDate(0, 0, -7)

	case "quarter":
		// Current quarter: last 90 days
		currentStart = now.AddDate(0, 0, -90)
		// Previous quarter: 180 days ago to 90 days ago
		previousEnd = currentStart
		previousStart = currentStart.AddDate(0, 0, -90)

	default: // "month" is default
		// Current month: last 30 days
		currentStart = now.AddDate(0, 0, -30)
		// Previous month: 60 days ago to 30 days ago
		previousEnd = currentStart
		previousStart = currentStart.AddDate(0, 0, -30)
	}

	return currentStart, currentEnd, previousStart, previousEnd
}

func (s *dashboardService) getTotalContactsStats(tenantID uint, currentStart, currentEnd, previousStart, previousEnd time.Time) (MetricData, error) {
	// Count contacts in current period
	currentCount, err := s.contactRepo.CountByDateRange(tenantID, currentStart, currentEnd)
	if err != nil {
		return MetricData{}, err
	}

	// Count contacts in previous period
	previousCount, err := s.contactRepo.CountByDateRange(tenantID, previousStart, previousEnd)
	if err != nil {
		return MetricData{}, err
	}

	// Calculate growth percentage
	growthPercentage := s.calculateGrowthPercentage(currentCount, previousCount)

	return MetricData{
		Current:          currentCount,
		Previous:         previousCount,
		GrowthPercentage: growthPercentage,
	}, nil
}

func (s *dashboardService) getRecentActivitiesStats(tenantID uint, currentStart, currentEnd, previousStart, previousEnd time.Time) (MetricData, error) {
	// Count audit logs (activities) in current period
	currentCount, err := s.auditLogRepo.CountByDateRange(tenantID, currentStart, currentEnd)
	if err != nil {
		return MetricData{}, err
	}

	// Count audit logs in previous period
	previousCount, err := s.auditLogRepo.CountByDateRange(tenantID, previousStart, previousEnd)
	if err != nil {
		return MetricData{}, err
	}

	// Calculate growth percentage
	growthPercentage := s.calculateGrowthPercentage(currentCount, previousCount)

	return MetricData{
		Current:          currentCount,
		Previous:         previousCount,
		GrowthPercentage: growthPercentage,
	}, nil
}

func (s *dashboardService) calculateGrowthPercentage(current, previous int) float64 {
	if previous == 0 {
		if current > 0 {
			return 100.0
		}
		return 0.0
	}
	return ((float64(current) - float64(previous)) / float64(previous)) * 100.0
}
