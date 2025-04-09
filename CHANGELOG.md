# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2025-04-10
### Added
- New utility file ratingCalculator.ts for consistent rating calculations
- Function to determine classification based on B0 value
- New units to parameters
- Enhanced visual display of ratings with better indicators
- Translation keys for stress levels and risk categories
### Fixed
- Consistent rating calculation by summing all ratings from datapoints
- Removed hardcoded parameter UUIDs
- Report data handling in OutputView.tsx component
- Classification display with improved visual presentation
- Data transfer in AnalysisPanel with proper datapoint ID passing
- Project page refresh error
- Norms-related calculations and displays
- Loading-related bugs

## [1.0.5] - 2025-04-08
### Added
- Coordinate validation and formatting utilities
- Sorting functionality for data tables (materials, experts, foundations, etc.)
- Select all/deselect all functionality for datapoints in analysis
### Fixed
- Version management system with proper database constraints
- Automatic zone creation when creating a new field
- Proper WHERE clauses in version update operations
- Coordinate input validation with helpful error messages
- Database migrations for version management

## [1.0.4] - 2025-04-07
### Added
- Status region implementation for critical notifications
- Optimized data pagination for large datasets
- Conditional field visibility based on user permissions
### Fixed
- Row-level security policy for versions table
- Customer/project assignment validation on first access
- Zone-field relationship integrity constraints
- Timestamp-based sorting functionality for lists
- Query optimization for concurrent user sessions

## [1.0.3] - 2025-04-07
### Added
- Named sorting functionality for data lists
- Entry display order consistency across sessions
- Header color-coding for visual data hierarchy
- Optional unit display in measurement fields
- Enhanced field validation for coordinate data
### Fixed
- Row-level security policy for versions table
- Random customer selection on login sequence
- Automatic filter adaptation with fewer elements
- Login display synchronization issues
- Data structure consistency in project "Llanwern"

## [1.0.2] - 2025-04-07
### Added
- Report deletion functionality
- Datapoint count badges in zone list view
- Field count badges in project view
### Fixed
- Error handling in report creation process

## [1.0.1] - 2025-04-05
### Added
- Support for multiple languages
- Improved error handling in API requests
- Better mobile responsiveness
### Fixed
- Authentication issues with admin users
- Performance optimizations for large datasets

## [1.0.0] - 2025-04-01
### Added
- Initial release
- Project management functionality
- Field and zone management
- Datapoint collection and analysis
- Report generation
- User authentication and authorization
