# MedPrep Tracker

A comprehensive health symptom tracking application designed to help patients document their symptoms, analyze life impacts, and prepare for doctor visits. Built with a modern glassmorphism UI and powered by Firebase.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange.svg)
![License](https://img.shields.io/badge/license-Custom-red.svg)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Important Limitations](#important-limitations)
- [Privacy and Security](#privacy-and-security)
- [Medical Disclaimer](#medical-disclaimer)
- [License](#license)
- [Commercial Use](#commercial-use)
- [Third-Party Licenses](#third-party-licenses)
- [Legal Disclaimer](#legal-disclaimer)
- [Support](#support)

## Features

### Interactive Body Map
- Click-to-select body region interface
- Visual feedback with animated selections
- Comprehensive anatomical coverage from head to toe

### Life Impact Analysis
Track how symptoms affect daily life across five key categories:
- **Work/School Impact** - Productivity and attendance effects
- **Sleep Quality** - Rest and recovery patterns
- **Social Activities** - Impact on relationships and events
- **Mobility** - Physical movement and functional limitations
- **Mood** - Emotional wellbeing assessment

### Sleep Tracking
- Log bedtime and wake times with datetime precision
- Rate sleep quality on a 1-5 scale
- Track correlations between sleep patterns and symptoms
- Export sleep data as CSV for external analysis

### Photo Documentation
- Upload symptom photos for visual documentation
- Maximum of 17 photos total across all symptoms
- Photos stored as base64-encoded strings in Firestore
- 1MB file size limit per photo
- Visual timeline with expandable image preview

### Appointment Preparation
- Auto-generate visit summaries based on symptom history
- Create and manage custom questions for healthcare providers
- Review symptom patterns and functional impact trends
- Export comprehensive medical reports with photos

### Medical Report Generation
- Professional PDF generation with embedded photos
- Customizable timeframes: 2 weeks, 1 month, 3 months, 6 months, or all time
- Summary statistics including severity averages and peak values
- Life impact analysis and sleep correlation insights
- Professional formatting suitable for healthcare providers

### Authentication
- Google Sign-In integration
- Email and password authentication
- Anonymous demo mode for evaluation
- Secure user data isolation by user ID

## Tech Stack

- **Frontend:** HTML5, CSS3 (Glassmorphism design), Vanilla JavaScript ES6+
- **Backend:** Firebase Firestore (NoSQL cloud database)
- **Authentication:** Firebase Authentication
- **PDF Export:** jsPDF 2.5.1
- **Design:** Modern glassmorphism with gradient animations and micro-interactions

## Getting Started

### Access the Application

Visit the live application at: https://zafeera123.github.io/nutribod-app/

No installation required - simply:
1. Open the URL in your web browser
2. Sign in using Google, Email, or try Anonymous demo mode
3. Start tracking your symptoms immediately

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection
- JavaScript enabled

## Usage Guide

### Getting Started

**1. Authentication**
- Select your preferred sign-in method: Google, Email/Password, or Anonymous
- Your health data is automatically isolated to your account
- Anonymous mode allows feature evaluation without account creation

**2. Logging a Symptom**
- Click on a body part in the interactive anatomical map
- Select the symptom type from the dropdown menu
- Adjust the severity slider (1-10 scale)
- Provide a detailed description of the symptom
- Complete the life impact assessment across all five categories
- Optionally upload a photo (must be under 1MB)
- Set the datetime when the symptom began
- Add any additional notes about triggers or patterns
- Click "Log Symptom" to save

**3. Sleep Tracking**
- Navigate to the Sleep tab in the main navigation
- Enter bedtime using the datetime picker
- Enter wake time using the datetime picker
- Rate overall sleep quality on a 1-5 scale
- Add notes about factors affecting sleep
- Click "Log Sleep" to save the entry

**4. Reviewing History**
- Navigate to the History tab
- View all logged symptoms in reverse chronological order
- Use filters to narrow by body region or specific date
- Review automatically generated pattern insights
- Click on photos to enlarge them
- Delete individual symptoms or bulk delete all data

**5. Preparing for Appointments**
- Go to the Appointment tab
- Enter doctor name and appointment datetime
- Add the primary reason for the visit
- Review the auto-generated visit summary with key statistics
- Add custom questions to discuss with your healthcare provider
- Generate and review the comprehensive visit summary

**6. Generating Medical Reports**
- Navigate to the Reports tab
- Select desired timeframe from dropdown
- Click "Generate Medical Report"
- Review the preview with statistics and insights
- Download PDF for printing or sharing with healthcare providers

## Important Limitations

### Photo Storage Constraints
- **Maximum of 17 photos** can be stored across all symptoms
- Each photo must be **under 1MB** in file size
- Photo upload functionality is **completely disabled** when the 17-photo limit is reached
- To upload new photos after reaching the limit, delete old symptoms containing photos
- Photo limit warning appears at 15 photos

### Data Storage Considerations
- All data is stored in Firebase Firestore cloud database
- Photos are stored as base64-encoded strings
- Large collections of photos may impact application performance
- No local storage or offline functionality

### Browser Compatibility
- Requires modern browser with ES6+ JavaScript support
- Optimal experience on Chrome, Firefox, Safari, or Edge
- Internet connection required for all functionality
- Responsive design supports desktop, tablet, and mobile devices

## Privacy and Security

### Data Protection
- End-to-end user authentication via Firebase Auth
- All data isolated by unique user ID
- No cross-user data access or sharing
- Firestore security rules enforce user-level permissions

### Security Considerations
- HIPAA-aware design (consult legal counsel for full compliance verification)
- Anonymous mode available for privacy-conscious users
- Data stored on Google Cloud Platform infrastructure
- SSL/TLS encryption for data in transit

### User Control
- Users can delete individual symptoms or all data
- Account deletion removes all associated data
- Export functionality allows data portability

### Not HIPAA Compliant
**IMPORTANT:** This application is NOT HIPAA compliant in its current form. Healthcare providers should not use this application to store patient data subject to HIPAA regulations. This application is intended for personal use only.

## Medical Disclaimer

**CRITICAL: MedPrep Tracker is a documentation and organization tool only.**

This application is NOT:
- A diagnostic tool
- A replacement for professional medical advice
- Suitable for medical emergencies
- A treatment recommendation system

This application IS:
- Designed to help you document symptoms
- A tool for organizing health information
- An aid for communicating with healthcare providers
- A preparation tool for medical appointments

**IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CALL 911 OR YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY.**

Always consult with qualified healthcare professionals for medical advice, diagnosis, and treatment. Do not use this application to self-diagnose or delay seeking professional medical care.

For complete medical and legal disclaimers, please read the [DISCLAIMER.md](DISCLAIMER.md) file.

## License

This project is licensed under a **Custom License** with specific terms for use, modification, and commercial distribution.

**Copyright (c) 2025 Zafeer Ahmed. All rights reserved.**

### License Summary

**You MAY:**
- ✓ Use the application at the provided URL for personal health tracking
- ✓ Modify the code for personal, educational, or non-profit use (with attribution)
- ✓ Create substantially modified versions for commercial use (with revenue sharing)

**You MAY NOT:**
- ✗ Use or distribute the original, unmodified software
- ✗ Sell or commercialize superficial modifications (branding/colors only)
- ✗ Use commercially without contacting the copyright holder
- ✗ Remove copyright notices or attribution

**Key Requirements:**
1. **Attribution Required:** All modified versions must credit "Based on MedPrep Tracker by [Your Name]"
2. **No Verbatim Use:** Original unmodified software cannot be used or distributed
3. **Commercial Use:** Requires substantial modifications AND revenue sharing agreement
4. **Non-Commercial Use:** Free for personal, educational, and non-profit use with attribution

### Full License Terms

See the complete [LICENSE](LICENSE) file for detailed terms and conditions.

## Commercial Use

### Interested in Commercial Use?

If you want to create a commercial product based on MedPrep Tracker:

**Requirements:**
1. Make substantial modifications to the software (not just branding changes)
2. Contact the copyright holder before launch
3. Negotiate revenue sharing agreement (typically 5-10% of gross revenue)
4. Maintain attribution to the original project
5. Comply with all license terms

**Contact for Commercial Licensing:**
- Email: nutribod135@gmail.com
- Subject: "MedPrep Tracker Commercial License Inquiry"

**Include in your inquiry:**
- Description of your planned modifications
- Intended use case and target market
- Expected revenue model
- Proposed revenue share percentage

**We're open to fair negotiations that benefit both parties while respecting the original work.**

## Third-Party Licenses

This project uses the following third-party libraries and services:

### Firebase SDK (v10.7.1)
- **License:** Apache License 2.0
- **Copyright:** Google LLC
- **Used for:** Authentication, Firestore Database, Cloud Storage

### jsPDF (v2.5.1)
- **License:** MIT License
- **Copyright:** James Hall and contributors
- **Used for:** PDF report generation

For complete third-party license information and attributions, see [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md).

## Legal Disclaimer

By using MedPrep Tracker, you acknowledge and agree to the following:

1. This software is provided "AS IS" without warranty of any kind
2. The developers are not liable for any health outcomes or decisions
3. You use this application at your own risk
4. You will seek professional medical advice for all health concerns
5. This application is not HIPAA compliant and should not be used by healthcare providers for patient data
6. You agree to comply with the custom license terms for any use or modification

For the complete legal disclaimer including liability limitations, privacy considerations, and terms of use, please read the [DISCLAIMER.md](DISCLAIMER.md) file.

## Support

For issues, questions, or feature requests:

- **Email:** nutribod135@gmail.com
- **Report Issues:** Describe your problem including browser type and steps to reproduce

### Reporting Issues

When reporting issues, include:
- Browser and version
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots if helpful

### Commercial License Inquiries

For commercial use discussions:
- Email: nutribod135@gmail.com
- Subject: "MedPrep Tracker Commercial License Inquiry"

## Disclaimer Summary

**REMEMBER:** This application:
- Is NOT a medical device
- Is NOT FDA approved
- Is NOT HIPAA compliant
- Should NOT be used for diagnosis
- Should NOT replace professional medical care

**For medical emergencies, call 911 immediately.**

---

**MedPrep Tracker - Professional Health Documentation for Better Patient Care**

*This application assists in tracking and communicating symptoms. Always consult healthcare professionals for medical advice, diagnosis, and treatment.*

**Copyright (c) 2025 Zafeer Ahmed**  
**Licensed under Custom License - See LICENSE file**  
**Last Updated:** January 2025  
**Version:** 1.0.0
