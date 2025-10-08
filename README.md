# MedPrep Tracker

A comprehensive health symptom tracking application designed to help patients document their symptoms, analyze life impacts, and prepare for doctor visits. Built with a modern glassmorphism UI and powered by Firebase.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Important Limitations](#important-limitations)
- [Privacy and Security](#privacy-and-security)
- [Medical Disclaimer](#medical-disclaimer)
- [License](#license)
- [Third-Party Licenses](#third-party-licenses)
- [Legal Disclaimer](#legal-disclaimer)
- [Contributing](#contributing)
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

## Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Firebase account for production deployment
- Basic understanding of Firebase console for configuration

### Local Development Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/medprep-tracker.git
cd medprep-tracker
```

#### Step 2: Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database in your Firebase project
3. Enable Authentication methods:
   - Google Sign-In
   - Email/Password
   - Anonymous
4. Copy your Firebase configuration credentials

#### Step 3: Update Firebase Configuration

In the `index.html` file, locate the Firebase configuration section and replace with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

#### Step 4: Configure Firestore Security Rules

In the Firebase Console, set up the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /symptoms/{symptomId} {
      allow read, write: if request.auth != null && 
                        request.resource.data.userId == request.auth.uid;
    }
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
                        request.resource.data.userId == request.auth.uid;
    }
    match /sleep/{sleepId} {
      allow read, write: if request.auth != null && 
                        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Step 5: Launch the Application

Open `index.html` directly in your browser, or use a local development server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Navigate to `http://localhost:8000` in your browser.

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

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for complete details.

```
MIT License

Copyright (c) 2025 [Zafeer Ahmed]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

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

For the complete legal disclaimer including liability limitations, privacy considerations, and terms of use, please read the [DISCLAIMER.md](DISCLAIMER.md) file.

## Project Structure

```
medprep-tracker/
├── LICENSE                       # MIT License
├── DISCLAIMER.md                 # Medical and legal disclaimer
├── THIRD-PARTY-LICENSES.md      # Third-party library attributions
├── README.md                     # This file
├── index.html                    # Main application file
├── script.js                     # Application logic
└── style.css                     # Glassmorphism styles
```

## Contributing

Contributions are welcome and appreciated. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeatureName`
3. Commit your changes: `git commit -m 'Add detailed description of feature'`
4. Push to the branch: `git push origin feature/YourFeatureName`
5. Open a Pull Request with a comprehensive description

### Development Guidelines
- Follow existing code style and conventions
- Test all functionality before submitting PR
- Update documentation for new features
- Ensure responsive design compatibility
- Do not make medical claims in code or documentation
- Maintain HIPAA non-compliance notices if applicable

### Code of Conduct
- Be respectful and professional
- Focus on constructive feedback
- Remember this is a health-related application affecting real people
- Prioritize user safety and clear disclaimers

## Roadmap

Potential future enhancements:
- Medication tracking
- Symptom trend graphs and visualizations
- Export to multiple formats (JSON, XML)
- Offline functionality with local storage
- Multi-language support
- Accessibility improvements (WCAG 2.1 compliance)
- Mobile app versions (iOS/Android)

**Note:** Any new features must maintain clear medical disclaimers and avoid diagnostic functionality.

## Known Issues

- PDF generation may timeout with large numbers of photos
- Base64 photo storage increases Firestore costs with high usage
- No offline support - requires internet connection
- Photos cannot be edited after upload (must delete and re-add)
- 17-photo limit is hardcoded (not configurable without code changes)

For bug reports, please open an issue on GitHub with:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Support

For issues, questions, or feature requests:

- **GitHub Issues:** Open an issue in the repository
- **Email:** nutribod135@gmail.com
- **Documentation:** See inline code comments and this README

### Before Requesting Support

1. Read the [DISCLAIMER.md](DISCLAIMER.md) - many questions are answered there
2. Check existing GitHub issues for similar problems
3. Verify your Firebase configuration is correct
4. Test in incognito/private mode to rule out browser extensions

### Reporting Security Issues

If you discover a security vulnerability:
- **DO NOT** open a public GitHub issue
- Email: nutribod135@gmail.com with details
- Use subject line: "Security: MedPrep Tracker"
- Allow reasonable time for response before public disclosure

## Acknowledgments

- Firebase team for excellent backend services
- jsPDF contributors for PDF generation capabilities
- The open source community for inspiration and best practices
- Healthcare professionals who provided feedback on usability

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

**Last Updated:** January 2025  
**Version:** 1.0.0  
**License:** MIT
