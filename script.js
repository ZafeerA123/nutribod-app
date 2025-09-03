// Enhanced Symptom Tracker Application with Life Impact and Sleep Tracking
class SymptomTracker {
    constructor() {
        this.symptoms = [];
        this.appointments = [];
        this.sleepEntries = [];
        this.selectedRegion = null;
        this.currentTab = 'tracker';
        this.currentUser = null;
        this.PHOTO_LIMIT = 20;
        this.WARNING_THRESHOLD = 15;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSeverityDisplay();
        this.updateFilterOptions();
        this.createPhotoWarningDiv();
        console.log('Enhanced MedPrep Tracker initialized successfully!');
    }

    setupEventListeners() {
        // Body part click handlers
        document.querySelectorAll('.body-part.hoverable').forEach(part => {
            part.addEventListener('click', (e) => {
                this.selectBodyPart(e.target.dataset.region);
            });
        });

        // Severity slider
        const severitySlider = document.getElementById('severity');
        if (severitySlider) {
            severitySlider.addEventListener('input', (e) => {
                this.updateSeverityDisplay(e.target.value);
            });
        }

        // Sleep quality slider
        const sleepQualitySlider = document.getElementById('sleep-quality');
        if (sleepQualitySlider) {
            sleepQualitySlider.addEventListener('input', (e) => {
                this.updateSleepQualityDisplay(e.target.value);
            });
        }

        // Set default datetime to now
        const timeInput = document.getElementById('symptom-time');
        if (timeInput) {
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            timeInput.value = localDateTime;
        }

        // Set sleep bedtime and wake time defaults
        const bedtimeInput = document.getElementById('bedtime');
        const waketimeInput = document.getElementById('waketime');
        if (bedtimeInput && waketimeInput) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(22, 0, 0, 0); // 10 PM
            
            const today = new Date();
            today.setHours(7, 0, 0, 0); // 7 AM
            
            bedtimeInput.value = yesterday.toISOString().slice(0, 16);
            waketimeInput.value = today.toISOString().slice(0, 16);
        }

        // Form validation listeners
        this.setupFormValidation();
    }

    setupFormValidation() {
        const requiredFields = ['symptom-type', 'symptom-description'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => this.clearFieldError(fieldId));
            }
        });
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(fieldId);

        switch(fieldId) {
            case 'symptom-type':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please select a symptom type';
                }
                break;
            case 'symptom-description':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please describe your symptom';
                } else if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Description must be at least 3 characters';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(fieldId, errorMessage);
        }

        return isValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.style.borderColor = '#ef4444';
        field.style.background = 'rgba(239, 68, 68, 0.1)';

        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.cssText = 'color: #ef4444; font-size: 0.8rem; margin-top: 4px; animation: fadeIn 0.3s ease;';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        field.style.background = 'rgba(255, 255, 255, 0.05)';

        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateForm() {
        const isRegionSelected = !!this.selectedRegion;
        const isTypeValid = this.validateField('symptom-type');
        const isDescriptionValid = this.validateField('symptom-description');

        if (!isRegionSelected) {
            this.showToast('Please select a body region first', 'error');
            return false;
        }

        return isTypeValid && isDescriptionValid;
    }

    updateFilterOptions() {
        const filterSelect = document.getElementById('filter-region');
        if (!filterSelect) return;

        const bodyRegions = [
            'head', 'neck', 'left-shoulder', 'right-shoulder', 'left-upper-arm', 'right-upper-arm',
            'left-elbow', 'right-elbow', 'left-forearm', 'right-forearm', 'left-hand', 'right-hand',
            'chest', 'abdomen', 'lower-back', 'pelvis', 'left-thigh', 'right-thigh',
            'left-knee', 'right-knee', 'left-calf', 'right-calf', 'left-ankle', 'right-ankle',
            'left-foot', 'right-foot'
        ];

        filterSelect.innerHTML = '<option value="">All body regions</option>';

        bodyRegions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            filterSelect.appendChild(option);
        });
    }

    // Get Life Impact Data from form
    getLifeImpactData() {
        const impactData = {};
        
        // Work impact
        const workImpact = document.querySelector('input[name="work-impact"]:checked');
        impactData.work = workImpact ? workImpact.value : 'none';
        
        // Sleep impact
        const sleepImpact = document.querySelector('input[name="sleep-impact"]:checked');
        impactData.sleep = sleepImpact ? sleepImpact.value : 'none';
        
        // Social impact
        const socialImpact = document.querySelector('input[name="social-impact"]:checked');
        impactData.social = socialImpact ? socialImpact.value : 'none';
        
        // Mobility impact
        const mobilityImpact = document.querySelector('input[name="mobility-impact"]:checked');
        impactData.mobility = mobilityImpact ? mobilityImpact.value : 'none';
        
        // Mood impact
        const moodImpact = document.querySelector('input[name="mood-impact"]:checked');
        impactData.mood = moodImpact ? moodImpact.value : 'none';
        
        return impactData;
    }

    // Load user data from Firestore
    async loadUserData() {
        if (!this.currentUser || !window.db) return;

        try {
            const { collection, query, where, orderBy, getDocs } = window.firebaseOperations;
            
            // Load symptoms
            const symptomsRef = collection(window.db, 'symptoms');
            const symptomsQuery = query(
                symptomsRef,
                where('userId', '==', this.currentUser.uid),
                orderBy('datetime', 'desc')
            );
            const symptomsSnapshot = await getDocs(symptomsQuery);
            
            this.symptoms = [];
            symptomsSnapshot.forEach((doc) => {
                this.symptoms.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Load appointments
            const appointmentsRef = collection(window.db, 'appointments');
            const appointmentsQuery = query(
                appointmentsRef,
                where('userId', '==', this.currentUser.uid),
                orderBy('created', 'desc')
            );
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            
            this.appointments = [];
            appointmentsSnapshot.forEach((doc) => {
                this.appointments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Load sleep entries
            const sleepRef = collection(window.db, 'sleep');
            const sleepQuery = query(
                sleepRef,
                where('userId', '==', this.currentUser.uid),
                orderBy('bedtime', 'desc')
            );
            const sleepSnapshot = await getDocs(sleepQuery);
            
            this.sleepEntries = [];
            sleepSnapshot.forEach((doc) => {
                this.sleepEntries.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.updateStats();
            this.renderHistory();
            this.renderSleepHistory();
            this.generatePatternInsights();
            console.log(`Loaded ${this.symptoms.length} symptoms, ${this.appointments.length} appointments, and ${this.sleepEntries.length} sleep entries for user`);

            // Check photo limit after loading data
            this.updatePhotoLimitStatus();

        } catch (error) {
            console.error('Error loading user data:', error);
            this.showToast('Error loading your data', 'error');
        }
    }

    selectBodyPart(region) {
        document.querySelectorAll('.body-part.selected').forEach(part => {
            part.classList.remove('selected');
        });

        const selectedPart = document.querySelector(`[data-region="${region}"]`);
        if (selectedPart) {
            selectedPart.classList.add('selected');
        }

        this.selectedRegion = region;
        this.showSymptomForm(region);
    }

    showSymptomForm(region) {
        const form = document.getElementById('symptom-form');
        const instruction = document.getElementById('instruction-text');
        const regionDisplay = document.getElementById('region-display');

        if (instruction) instruction.style.display = 'none';
        if (form) form.style.display = 'block';
        
        if (regionDisplay) {
            regionDisplay.textContent = region.replace('-', ' ').toUpperCase();
        }

        setTimeout(() => {
            const firstInput = document.getElementById('symptom-type');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    updateSeverityDisplay(value = null) {
        const slider = document.getElementById('severity');
        const display = document.getElementById('severity-display');
        const label = document.querySelector('.severity-label');
        
        if (!slider || !display) return;

        const severityValue = value || slider.value;
        display.textContent = severityValue;

        const labels = {
            1: 'Very Mild', 2: 'Very Mild', 
            3: 'Mild', 4: 'Mild',
            5: 'Moderate', 6: 'Moderate',
            7: 'Severe', 8: 'Severe',
            9: 'Very Severe', 10: 'Extreme'
        };

        if (label) {
            label.textContent = labels[severityValue] || 'Moderate';
        }

        const colors = {
            1: '#22c55e', 2: '#22c55e',
            3: '#84cc16', 4: '#84cc16',
            5: '#eab308', 6: '#eab308',
            7: '#f97316', 8: '#f97316',
            9: '#ef4444', 10: '#dc2626'
        };

        const color = colors[severityValue] || '#eab308';
        slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${severityValue * 10}%, rgba(255,255,255,0.1) ${severityValue * 10}%, rgba(255,255,255,0.1) 100%)`;
    }

    // Update sleep quality display
    updateSleepQualityDisplay(value = null) {
        const slider = document.getElementById('sleep-quality');
        const display = document.getElementById('sleep-quality-display');
        const label = document.querySelector('.sleep-quality-label');
        
        if (!slider || !display) return;

        const qualityValue = value || slider.value;
        display.textContent = qualityValue;

        const labels = {
            1: 'Terrible', 2: 'Poor', 
            3: 'Fair', 4: 'Good',
            5: 'Excellent'
        };

        if (label) {
            label.textContent = labels[qualityValue] || 'Fair';
        }

        const colors = {
            1: '#dc2626', 2: '#ef4444',
            3: '#eab308', 4: '#84cc16',
            5: '#22c55e'
        };

        const color = colors[qualityValue] || '#eab308';
        slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${qualityValue * 20}%, rgba(255,255,255,0.1) ${qualityValue * 20}%, rgba(255,255,255,0.1) 100%)`;
    }

    // FIXED: Photo limit checking with proper UI updates
    createPhotoWarningDiv() {
        if (document.getElementById('photo-limit-warning')) return;
        
        const warningDiv = document.createElement('div');
        warningDiv.id = 'photo-limit-warning';
        warningDiv.style.cssText = `
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 8px;
            padding: 10px;
            margin: 10px 0;
            font-size: 0.9rem;
            display: none;
            text-align: center;
        `;
        
        const photoSection = document.querySelector('.photo-upload-section');
        if (photoSection) {
            photoSection.insertBefore(warningDiv, photoSection.firstChild);
        }
    }

    updatePhotoLimitStatus() {
        const symptomsWithPhotos = this.symptoms.filter(s => s.photoBase64);
        const used = symptomsWithPhotos.length;
        
        if (used >= this.PHOTO_LIMIT) {
            this.disablePhotoUpload(used);
        } else if (used >= this.WARNING_THRESHOLD) {
            this.showPhotoWarning(used);
        } else {
            this.hidePhotoWarning();
            this.enablePhotoUpload();
        }
    }

    showPhotoWarning(used) {
        const warningDiv = document.getElementById('photo-limit-warning');
        if (warningDiv) {
            warningDiv.innerHTML = `
                <span style="color: #f59e0b;">⚠️ Photo storage: ${used}/${this.PHOTO_LIMIT} used. ${this.PHOTO_LIMIT - used} remaining.</span>
            `;
            warningDiv.style.display = 'block';
        }
    }

    hidePhotoWarning() {
        const warningDiv = document.getElementById('photo-limit-warning');
        if (warningDiv) {
            warningDiv.style.display = 'none';
        }
    }

    disablePhotoUpload(used) {
        const photoInput = document.getElementById('symptom-photo');
        const photoLabel = document.querySelector('label[for="symptom-photo"]');
        const warningDiv = document.getElementById('photo-limit-warning');
        
        if (photoInput) {
            photoInput.disabled = true;
            photoInput.style.display = 'none';
        }
        
        if (photoLabel) {
            photoLabel.innerHTML = `
                <span style="color: #ef4444; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span>📵</span>
                    Photo limit reached (${used}/${this.PHOTO_LIMIT})
                </span>
            `;
            photoLabel.style.background = 'rgba(239, 68, 68, 0.1)';
            photoLabel.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            photoLabel.style.cursor = 'not-allowed';
            photoLabel.onclick = (e) => {
                e.preventDefault();
                this.showToast('Photo limit reached. Delete photos in History tab to upload new ones.', 'error');
            };
        }

        if (warningDiv) {
            warningDiv.innerHTML = `
                <span style="color: #ef4444;">🚫 Maximum photo storage reached (${this.PHOTO_LIMIT}/${this.PHOTO_LIMIT}). Delete old photos in History tab to upload new ones.</span>
            `;
            warningDiv.style.display = 'block';
            warningDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            warningDiv.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }
    }

    enablePhotoUpload() {
        const photoInput = document.getElementById('symptom-photo');
        const photoLabel = document.querySelector('label[for="symptom-photo"]');
        
        if (photoInput) {
            photoInput.disabled = false;
            photoInput.style.display = 'block';
        }
        
        if (photoLabel && (photoLabel.innerHTML.includes('Photo limit reached') || photoLabel.innerHTML.includes('📵'))) {
            photoLabel.innerHTML = `
                <span class="btn-icon">📷</span>
                Choose Photo
            `;
            photoLabel.style.background = 'rgba(255, 255, 255, 0.1)';
            photoLabel.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            photoLabel.style.cursor = 'pointer';
            photoLabel.onclick = null;
        }
    }

    // FIXED: Photo validation that checks limits before processing
    validatePhotoUpload(file) {
        if (!file) return { valid: false, message: 'No file selected' };
        
        // Check file size
        if (file.size > 1024 * 1024) {
            return { 
                valid: false, 
                message: 'File too large. Please choose an image under 1MB.' 
            };
        }

        // Check photo limit
        const symptomsWithPhotos = this.symptoms.filter(s => s.photoBase64);
        if (symptomsWithPhotos.length >= this.PHOTO_LIMIT) {
            return { 
                valid: false, 
                message: `Photo limit reached (${this.PHOTO_LIMIT} maximum). Delete old photos to upload new ones.` 
            };
        }

        return { valid: true };
    }

    // Save sleep entry
    async saveSleep() {
        if (!this.currentUser) {
            this.showToast('Please sign in to save sleep data', 'error');
            return;
        }

        const bedtime = document.getElementById('bedtime')?.value;
        const waketime = document.getElementById('waketime')?.value;
        const quality = document.getElementById('sleep-quality')?.value;
        const notes = document.getElementById('sleep-notes')?.value;

        if (!bedtime || !waketime) {
            this.showToast('Please enter both bedtime and wake time', 'error');
            return;
        }

        // Calculate sleep duration
        const bedDate = new Date(bedtime);
        const wakeDate = new Date(waketime);
        const duration = (wakeDate - bedDate) / (1000 * 60 * 60); // hours

        const sleepEntry = {
            userId: this.currentUser.uid,
            bedtime: bedtime,
            waketime: waketime,
            duration: duration,
            quality: parseInt(quality),
            notes: notes,
            created: new Date().toISOString()
        };

        try {
            const saveButton = document.querySelector('#save-sleep-btn');
            const originalContent = saveButton.innerHTML;
            saveButton.disabled = true;
            saveButton.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; margin: 0;"></div> Saving...';

            const { collection, addDoc } = window.firebaseOperations;
            const docRef = await addDoc(collection(window.db, 'sleep'), sleepEntry);
            
            this.sleepEntries.unshift({
                id: docRef.id,
                ...sleepEntry
            });

            this.showToast('Sleep entry logged successfully!');
            this.renderSleepHistory();
            this.updateStats();

            saveButton.disabled = false;
            saveButton.innerHTML = originalContent;

        } catch (error) {
            console.error('Error saving sleep entry:', error);
            this.showToast('Failed to save sleep entry. Please try again.', 'error');
            
            const saveButton = document.querySelector('#save-sleep-btn');
            saveButton.disabled = false;
            saveButton.innerHTML = '<span class="btn-icon">💾</span>Log Sleep';
        }
    }

    // Render sleep history
    renderSleepHistory() {
        const timeline = document.getElementById('sleep-timeline');
        if (!timeline) return;

        if (this.sleepEntries.length === 0) {
            timeline.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 40px;">No sleep data logged yet. Start tracking your sleep patterns!</p>';
            return;
        }

        const sortedEntries = [...this.sleepEntries].sort((a, b) => 
            new Date(b.bedtime) - new Date(a.bedtime)
        );

        timeline.innerHTML = sortedEntries.slice(0, 10).map(entry => `
            <div class="timeline-item sleep-item" style="
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                border-left: 4px solid ${this.getSleepQualityColor(entry.quality)};
                transition: all 0.3s ease;
                cursor: pointer;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h4 style="color: #c4b5fd; font-size: 1.1rem; margin-bottom: 5px;">
                            Sleep Session
                        </h4>
                        <p style="color: rgba(255,255,255,0.9); margin-bottom: 8px;">
                            ${entry.duration.toFixed(1)} hours of sleep
                        </p>
                        <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                            Bedtime: ${new Date(entry.bedtime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                            → Wake: ${new Date(entry.waketime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="
                            background: ${this.getSleepQualityColor(entry.quality)};
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 0.8rem;
                            font-weight: 600;
                            margin-bottom: 5px;
                        ">
                            Quality: ${entry.quality}/5
                        </div>
                    </div>
                </div>
                ${entry.notes ? `<p style="color: rgba(255,255,255,0.7); font-style: italic; margin-top: 10px;">Notes: ${entry.notes}</p>` : ''}
            </div>
        `).join('');
    }

    // Get sleep quality color
    getSleepQualityColor(quality) {
        const colors = {
            1: '#dc2626', 2: '#ef4444',
            3: '#eab308', 4: '#84cc16',
            5: '#22c55e'
        };
        return colors[quality] || '#eab308';
    }

    generatePatternInsights() {
        const insightsDiv = document.getElementById('pattern-insights');
        if (!insightsDiv || this.symptoms.length < 3) {
            if (insightsDiv) {
                insightsDiv.innerHTML = '<p class="no-data">Log at least 3 symptoms to see patterns</p>';
            }
            return;
        }

        const patterns = this.analyzeSymptomPatterns();
        
        if (patterns.length === 0) {
            insightsDiv.innerHTML = '<p class="no-data">No significant patterns detected yet. Continue logging symptoms.</p>';
            return;
        }

        insightsDiv.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                ${patterns.map(pattern => `
                    <div style="
                        background: rgba(255,255,255,0.05);
                        padding: 15px;
                        border-radius: 8px;
                        border-left: 3px solid ${pattern.color};
                    ">
                        <h4 style="color: #c4b5fd; font-size: 0.9rem; margin-bottom: 5px;">
                            ${pattern.title}
                        </h4>
                        <p style="color: rgba(255,255,255,0.8); font-size: 0.85rem; line-height: 1.4;">
                            ${pattern.description}
                        </p>
                        <div style="
                            margin-top: 8px;
                            font-size: 0.75rem;
                            color: rgba(255,255,255,0.6);
                        ">
                            Confidence: ${pattern.confidence}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    analyzeSymptomPatterns() {
        const patterns = [];
        
        // Pattern 1: Most frequent body region
        const regionCounts = {};
        this.symptoms.forEach(symptom => {
            regionCounts[symptom.region] = (regionCounts[symptom.region] || 0) + 1;
        });

        const mostFrequentRegion = Object.keys(regionCounts).reduce((a, b) => 
            regionCounts[a] > regionCounts[b] ? a : b, ''
        );

        if (regionCounts[mostFrequentRegion] >= 2) {
            patterns.push({
                title: 'Most Affected Area',
                description: `Your ${mostFrequentRegion.replace('-', ' ')} has been affected ${regionCounts[mostFrequentRegion]} times. Consider discussing this pattern with your healthcare provider.`,
                confidence: regionCounts[mostFrequentRegion] >= 3 ? 'High' : 'Medium',
                color: '#f59e0b'
            });
        }

        // Pattern 2: Life impact analysis
        const impactAnalysis = this.analyzeLifeImpactPatterns();
        patterns.push(...impactAnalysis);

        // Pattern 3: Sleep correlation
        const sleepCorrelation = this.analyzeSleepSymptomCorrelation();
        if (sleepCorrelation) {
            patterns.push(sleepCorrelation);
        }

        return patterns.slice(0, 4);
    }

    // Analyze life impact patterns
    analyzeLifeImpactPatterns() {
        const patterns = [];
        const impactCounts = {
            work: { none: 0, mild: 0, moderate: 0, severe: 0 },
            sleep: { none: 0, mild: 0, moderate: 0, severe: 0 },
            social: { none: 0, mild: 0, moderate: 0, severe: 0 },
            mobility: { none: 0, mild: 0, moderate: 0, severe: 0 },
            mood: { none: 0, mild: 0, moderate: 0, severe: 0 }
        };

        this.symptoms.forEach(symptom => {
            if (symptom.lifeImpact) {
                Object.keys(impactCounts).forEach(category => {
                    const impact = symptom.lifeImpact[category] || 'none';
                    if (impactCounts[category][impact] !== undefined) {
                        impactCounts[category][impact]++;
                    }
                });
            }
        });

        // Find most impacted areas
        Object.keys(impactCounts).forEach(category => {
            const severeCounts = impactCounts[category].severe + impactCounts[category].moderate;
            const total = Object.values(impactCounts[category]).reduce((a, b) => a + b, 0);
            
            if (total >= 3 && severeCounts >= 2) {
                patterns.push({
                    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Impact Pattern`,
                    description: `Your symptoms significantly impact your ${category} in ${severeCounts} out of ${total} recorded instances. This functional impact is important to discuss with your doctor.`,
                    confidence: severeCounts >= 3 ? 'High' : 'Medium',
                    color: '#e11d48'
                });
            }
        });

        return patterns;
    }

    // Analyze sleep-symptom correlation
    analyzeSleepSymptomCorrelation() {
        if (this.sleepEntries.length < 3 || this.symptoms.length < 3) {
            return null;
        }

        let poorSleepSymptoms = 0;
        let goodSleepSymptoms = 0;
        let totalCorrelations = 0;

        this.symptoms.forEach(symptom => {
            const symptomDate = new Date(symptom.datetime);
            
            // Find sleep entry from the night before
            const sleepEntry = this.sleepEntries.find(sleep => {
                const sleepDate = new Date(sleep.bedtime);
                const timeDiff = Math.abs(symptomDate - sleepDate) / (1000 * 60 * 60);
                return timeDiff <= 24; // Within 24 hours
            });

            if (sleepEntry) {
                totalCorrelations++;
                if (sleepEntry.quality <= 2 && symptom.severity >= 6) {
                    poorSleepSymptoms++;
                } else if (sleepEntry.quality >= 4 && symptom.severity <= 4) {
                    goodSleepSymptoms++;
                }
            }
        });

        if (totalCorrelations >= 3 && (poorSleepSymptoms >= 2 || goodSleepSymptoms >= 2)) {
            return {
                title: 'Sleep-Symptom Correlation',
                description: `Analysis shows potential correlation between sleep quality and symptom severity. Consider discussing sleep hygiene with your healthcare provider.`,
                confidence: totalCorrelations >= 5 ? 'High' : 'Medium',
                color: '#8b5cf6'
            };
        }

        return null;
    }

    // Export sleep data as CSV
    exportSleepData() {
        if (this.sleepEntries.length === 0) {
            this.showToast('No sleep data to export', 'error');
            return;
        }

        const headers = ['Date', 'Bedtime', 'Wake Time', 'Duration (hours)', 'Quality (1-5)', 'Notes'];
        const csvData = [headers];

        this.sleepEntries.forEach(entry => {
            const bedDate = new Date(entry.bedtime);
            const wakeDate = new Date(entry.waketime);
            
            csvData.push([
                bedDate.toLocaleDateString(),
                bedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                wakeDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                entry.duration.toFixed(1),
                entry.quality,
                entry.notes || ''
            ]);
        });

        const csvContent = csvData.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medprep-sleep-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showToast('Sleep data exported successfully!');
    }

    // Export life impact data as CSV
    exportLifeImpactData() {
        const symptomsWithImpact = this.symptoms.filter(s => s.lifeImpact);
        
        if (symptomsWithImpact.length === 0) {
            this.showToast('No life impact data to export', 'error');
            return;
        }

        const headers = ['Date', 'Time', 'Body Region', 'Symptom Type', 'Severity', 'Work Impact', 'Sleep Impact', 'Social Impact', 'Mobility Impact', 'Mood Impact', 'Description'];
        const csvData = [headers];

        symptomsWithImpact.forEach(symptom => {
            const datetime = new Date(symptom.datetime);
            
            csvData.push([
                datetime.toLocaleDateString(),
                datetime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                symptom.region.replace('-', ' '),
                symptom.type,
                symptom.severity,
                symptom.lifeImpact.work || 'none',
                symptom.lifeImpact.sleep || 'none',
                symptom.lifeImpact.social || 'none',
                symptom.lifeImpact.mobility || 'none',
                symptom.lifeImpact.mood || 'none',
                symptom.description
            ]);
        });

        const csvContent = csvData.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medprep-life-impact-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showToast('Life impact data exported successfully!');
    }

    clearForm() {
        const inputs = ['symptom-type', 'symptom-description', 'symptom-notes'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
                this.clearFieldError(id);
            }
        });

        // Clear life impact radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        const severitySlider = document.getElementById('severity');
        if (severitySlider) {
            severitySlider.value = 5;
            this.updateSeverityDisplay(5);
        }

        const timeInput = document.getElementById('symptom-time');
        if (timeInput) {
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            timeInput.value = localDateTime;
        }

        // Clear photo
        const photoInput = document.getElementById('symptom-photo');
        const photoPreview = document.getElementById('photo-preview');
        const photoWarning = document.getElementById('photo-size-warning');
        
        if (photoInput) photoInput.value = '';
        if (photoPreview) photoPreview.style.display = 'none';
        if (photoWarning) photoWarning.style.display = 'none';

        const form = document.getElementById('symptom-form');
        const instruction = document.getElementById('instruction-text');
        
        if (form) form.style.display = 'none';
        if (instruction) instruction.style.display = 'block';

        document.querySelectorAll('.body-part.selected').forEach(part => {
            part.classList.remove('selected');
        });

        this.selectedRegion = null;
    }

    updateStats() {
        const totalElement = document.getElementById('total-symptoms');
        const weekElement = document.getElementById('this-week');
        const sleepStatsElement = document.getElementById('sleep-stats');

        if (totalElement) {
            totalElement.textContent = this.symptoms.length;
        }

        if (weekElement) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const thisWeekSymptoms = this.symptoms.filter(symptom => 
                new Date(symptom.datetime) >= oneWeekAgo
            );
            
            weekElement.textContent = thisWeekSymptoms.length;
        }

        // Update sleep stats
        if (sleepStatsElement && this.sleepEntries.length > 0) {
            const recentSleep = this.sleepEntries.slice(0, 7);
            const avgDuration = recentSleep.reduce((sum, entry) => sum + entry.duration, 0) / recentSleep.length;
            const avgQuality = recentSleep.reduce((sum, entry) => sum + entry.quality, 0) / recentSleep.length;
            
            sleepStatsElement.innerHTML = `
                <div class="stat">
                    <span class="stat-number">${avgDuration.toFixed(1)}h</span>
                    <span class="stat-label">Avg Sleep</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${avgQuality.toFixed(1)}/5</span>
                    <span class="stat-label">Avg Quality</span>
                </div>
            `;
        }
    }

    renderHistory() {
        const timeline = document.getElementById('symptom-timeline');
        if (!timeline) return;

        if (this.symptoms.length === 0) {
            timeline.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: rgba(255,255,255,0.6);">No symptoms logged yet. Start by clicking on the body map!</p>
                    <div style="margin-top: 20px;">
                        <button class="btn-primary" onclick="window.symptomTracker.switchTab('tracker')">
                            <span class="btn-icon">🎯</span>
                            Log Your First Symptom
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // Show photo usage stats
        const photoStats = this.getPhotoUsageStats();
        let photoWarning = '';
        if (photoStats.used > 0) {
            const warningColor = photoStats.percentage > 85 ? '#ef4444' : photoStats.percentage > 70 ? '#f59e0b' : '#4facfe';
            photoWarning = `
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 3px solid ${warningColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>📷 Photo Storage: ${photoStats.used}/${photoStats.limit} (${photoStats.percentage}%)</span>
                        <button class="btn-secondary" onclick="window.symptomTracker.deleteAllUserData()" style="font-size: 0.8rem; padding: 6px 12px;">
                            🗑️ Delete All Data
                        </button>
                    </div>
                </div>
            `;
        }

        const sortedSymptoms = [...this.symptoms].sort((a, b) => 
            new Date(b.datetime) - new Date(a.datetime)
        );

        timeline.innerHTML = photoWarning + sortedSymptoms.map(symptom => {
            let impactSummary = '';
            if (symptom.lifeImpact) {
                const impacts = Object.entries(symptom.lifeImpact)
                    .filter(([key, value]) => value && value !== 'none')
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                
                if (impacts) {
                    impactSummary = `<p style="color: rgba(245, 87, 108, 0.8); font-size: 0.85rem; margin-top: 8px;">Life Impact: ${impacts}</p>`;
                }
            }

            // Add photo display if exists
            let photoDisplay = '';
            if (symptom.photoBase64) {
                photoDisplay = `
                    <div style="margin-top: 10px; position: relative;">
                        <img src="${symptom.photoBase64}" 
                            alt="Symptom photo" 
                            style="max-width: 200px; max-height: 150px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1);"
                            onclick="this.style.maxWidth = this.style.maxWidth === '200px' ? '100%' : '200px'; this.style.maxHeight = this.style.maxHeight === '150px' ? 'auto' : '150px';"
                            onmouseover="this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)'; this.style.borderColor = 'rgba(255, 255, 255, 0.2)';"
                            onmouseout="this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; this.style.borderColor = 'rgba(255, 255, 255, 0.1)';"
                            title="Click to enlarge/shrink">
                        <div style="margin-top: 5px; font-size: 0.7rem; color: rgba(255,255,255,0.5);">
                            📷 ${symptom.photoFileName || 'Symptom Photo'}
                        </div>
                    </div>
                `;
            }

            return `
                <div class="timeline-item" style="
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                    border-left: 4px solid ${this.getSeverityColor(symptom.severity)};
                    transition: all 0.3s ease;
                    position: relative;
                ">
                    <button onclick="window.symptomTracker.deleteSymptom('${symptom.id}')" style="
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: rgba(239, 68, 68, 0.8);
                        border: none;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.8rem;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgba(239, 68, 68, 1)'; this.style.transform='scale(1.1)'" 
                    onmouseout="this.style.background='rgba(239, 68, 68, 0.8)'; this.style.transform='scale(1)'"
                    title="Delete this symptom">×</button>
                    
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; margin-right: 40px;">
                        <div>
                            <h4 style="color: #c4b5fd; font-size: 1.1rem; margin-bottom: 5px;">
                                ${symptom.region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${symptom.type}
                            </h4>
                            <p style="color: rgba(255,255,255,0.9); margin-bottom: 8px;">
                                ${symptom.description}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <div style="
                                background: ${this.getSeverityColor(symptom.severity)};
                                color: white;
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 0.8rem;
                                font-weight: 600;
                                margin-bottom: 5px;
                            ">
                                Severity: ${symptom.severity}/10
                            </div>
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">
                                ${new Date(symptom.datetime).toLocaleDateString()} at ${new Date(symptom.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                    ${impactSummary}
                    ${photoDisplay}
                    ${symptom.notes ? `<p style="color: rgba(255,255,255,0.7); font-style: italic; margin-top: 10px;">Notes: ${symptom.notes}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    getSeverityColor(severity) {
        const colors = {
            1: '#22c55e', 2: '#22c55e',
            3: '#84cc16', 4: '#84cc16',
            5: '#eab308', 6: '#eab308',
            7: '#f97316', 8: '#f97316',
            9: '#ef4444', 10: '#dc2626'
        };
        return colors[severity] || '#eab308';
    }

    // Show current photo usage stats
    getPhotoUsageStats() {
        const symptomsWithPhotos = this.symptoms.filter(s => s.photoBase64);
        return {
            used: symptomsWithPhotos.length,
            limit: this.PHOTO_LIMIT,
            percentage: Math.round((symptomsWithPhotos.length / this.PHOTO_LIMIT) * 100)
        };
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.querySelector('.toast-message');
        const toastIcon = document.querySelector('.toast-icon');
        
        if (!toast || !toastMessage || !toastIcon) return;

        toastMessage.textContent = message;
        toastIcon.textContent = type === 'error' ? '❌' : '✅';

        if (type === 'error') {
            toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else {
            toast.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    async saveAppointment() {
        if (!this.currentUser) {
            this.showToast('Please sign in to save appointments', 'error');
            return;
        }

        const doctorName = document.getElementById('doctor-name')?.value;
        const appointmentDate = document.getElementById('appointment-date')?.value;
        const visitReason = document.getElementById('visit-reason')?.value;

        if (!doctorName || !appointmentDate) {
            this.showToast('Please fill in doctor name and appointment date', 'error');
            return;
        }

        const appointment = {
            userId: this.currentUser.uid,
            doctor: doctorName,
            datetime: appointmentDate,
            reason: visitReason,
            created: new Date().toISOString()
        };

        try {
            const { collection, addDoc } = window.firebaseOperations;
            const docRef = await addDoc(collection(window.db, 'appointments'), appointment);
            
            this.appointments.unshift({
                id: docRef.id,
                ...appointment
            });

            this.showToast('Appointment saved successfully!');
            this.generateVisitSummary();

        } catch (error) {
            console.error('Error saving appointment:', error);
            this.showToast('Failed to save appointment', 'error');
        }
    }

    generateVisitSummary() {
        const summaryDiv = document.getElementById('visit-summary');
        if (!summaryDiv) return;

        if (this.symptoms.length === 0) {
            summaryDiv.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No symptoms logged yet. Add some symptoms to generate a visit summary.</p>';
            return;
        }

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const recentSymptoms = this.symptoms.filter(symptom => 
            new Date(symptom.datetime) >= twoWeeksAgo
        );

        // Analyze life impact
        const impactAnalysis = this.analyzeLifeImpactForSummary(recentSymptoms);

        const regionCounts = {};
        const typeCounts = {};
        let totalSeverity = 0;

        recentSymptoms.forEach(symptom => {
            regionCounts[symptom.region] = (regionCounts[symptom.region] || 0) + 1;
            typeCounts[symptom.type] = (typeCounts[symptom.type] || 0) + 1;
            totalSeverity += symptom.severity;
        });

        const avgSeverity = recentSymptoms.length > 0 ? (totalSeverity / recentSymptoms.length).toFixed(1) : 0;
        const mostCommonRegion = Object.keys(regionCounts).reduce((a, b) => regionCounts[a] > regionCounts[b] ? a : b, '');
        const mostCommonType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b, '');

        summaryDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #4facfe;">${recentSymptoms.length}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Symptoms (2 weeks)</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #f093fb;">${avgSeverity}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Avg Severity</div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
                <h4 style="color: #c4b5fd; margin-bottom: 15px;">Key Points for Doctor:</h4>
                <ul style="color: rgba(255,255,255,0.9); line-height: 1.8; padding-left: 20px;">
                    ${recentSymptoms.length > 0 ? `
                        <li>Most affected area: <strong>${mostCommonRegion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> (${regionCounts[mostCommonRegion]} occurrences)</li>
                        <li>Most common symptom type: <strong>${mostCommonType}</strong></li>
                        <li>Average pain level: <strong>${avgSeverity}/10</strong></li>
                        <li>Total symptoms in last 2 weeks: <strong>${recentSymptoms.length}</strong></li>
                        ${impactAnalysis}
                    ` : '<li>No recent symptoms to summarize</li>'}
                </ul>
            </div>
        `;
    }

    // Analyze life impact for visit summary
    analyzeLifeImpactForSummary(symptoms) {
        const symptomsWithImpact = symptoms.filter(s => s.lifeImpact);
        if (symptomsWithImpact.length === 0) return '';

        const impactCounts = {
            work: 0, sleep: 0, social: 0, mobility: 0, mood: 0
        };

        symptomsWithImpact.forEach(symptom => {
            Object.keys(impactCounts).forEach(category => {
                const impact = symptom.lifeImpact[category];
                if (impact && impact !== 'none') {
                    impactCounts[category]++;
                }
            });
        });

        const significantImpacts = Object.entries(impactCounts)
            .filter(([key, count]) => count >= 2)
            .map(([key, count]) => `${key} (${count} times)`)
            .join(', ');

        if (significantImpacts) {
            return `<li><strong>Functional Impact:</strong> Symptoms significantly affected: ${significantImpacts}</li>`;
        }

        return '';
    }

    addQuestion() {
        const questionInput = document.getElementById('custom-question');
        const questionsList = document.getElementById('suggested-questions');
        
        if (!questionInput || !questionsList || !questionInput.value.trim()) {
            this.showToast('Please enter a question', 'error');
            return;
        }

        const questionDiv = document.createElement('div');
        questionDiv.className = 'suggested-question';
        questionDiv.style.background = 'rgba(255,255,255,0.05)';
        questionDiv.innerHTML = `
            <span class="question-icon">❓</span>
            <span>${questionInput.value.trim()}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: rgba(255,255,255,0.5);
                cursor: pointer;
                margin-left: auto;
                padding: 5px;
                border-radius: 4px;
                transition: color 0.3s;
            " onmouseover="this.style.color='rgba(255,255,255,0.8)'" 
               onmouseout="this.style.color='rgba(255,255,255,0.5)'">×</button>
        `;

        questionsList.appendChild(questionDiv);
        questionInput.value = '';
        this.showToast('Question added!');
    }

    filterHistory() {
        const regionFilter = document.getElementById('filter-region')?.value;
        const dateFilter = document.getElementById('filter-date')?.value;

        let filteredSymptoms = [...this.symptoms];

        if (regionFilter) {
            filteredSymptoms = filteredSymptoms.filter(symptom => 
                symptom.region === regionFilter
            );
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            filteredSymptoms = filteredSymptoms.filter(symptom => {
                const symptomDate = new Date(symptom.datetime);
                return symptomDate.toDateString() === filterDate.toDateString();
            });
        }

        this.renderFilteredHistory(filteredSymptoms);
        
        if (regionFilter || dateFilter) {
            const total = filteredSymptoms.length;
            const filterText = [];
            if (regionFilter) filterText.push(`region: ${regionFilter.replace('-', ' ')}`);
            if (dateFilter) filterText.push(`date: ${new Date(dateFilter).toLocaleDateString()}`);
            
            this.showToast(`Found ${total} symptoms for ${filterText.join(', ')}`);
        }
    }

    renderFilteredHistory(symptoms = null) {
        const timeline = document.getElementById('symptom-timeline');
        if (!timeline) return;

        const symptomsToShow = symptoms || this.symptoms;
        const sortedSymptoms = [...symptomsToShow].sort((a, b) => 
            new Date(b.datetime) - new Date(a.datetime)
        );

        if (sortedSymptoms.length === 0) {
            timeline.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 40px;">No symptoms match your filter criteria.</p>';
            return;
        }

        // Use the same rendering logic as renderHistory
        this.renderHistory();
    }

    // Simplified report generation
    generateReport() {
        const timeframe = document.getElementById('report-timeframe')?.value;
        const preview = document.getElementById('report-preview');
        
        if (!preview) return;

        if (this.symptoms.length === 0) {
            this.showToast('No symptoms logged yet. Add some symptoms first.', 'error');
            return;
        }

        this.showLoadingOverlay(true);

        setTimeout(() => {
            const reportData = this.getReportData(timeframe);
            this.showReportPreview(reportData);
            this.showLoadingOverlay(false);
            this.showToast('Medical report generated successfully!');
        }, 1500);
    }

    getReportData(timeframe) {
        let cutoffDate = new Date();
        
        switch(timeframe) {
            case '2weeks':
                cutoffDate.setDate(cutoffDate.getDate() - 14);
                break;
            case '1month':
                cutoffDate.setMonth(cutoffDate.getMonth() - 1);
                break;
            case '3months':
                cutoffDate.setMonth(cutoffDate.getMonth() - 3);
                break;
            case '6months':
                cutoffDate.setMonth(cutoffDate.getMonth() - 6);
                break;
            case 'all':
                cutoffDate = new Date(0); // Include all data
                break;
        }

        const relevantSymptoms = this.symptoms.filter(symptom => 
            new Date(symptom.datetime) >= cutoffDate
        );

        const regionStats = {};
        const typeStats = {};
        const severityStats = [];
        const impactStats = {
            work: 0, sleep: 0, social: 0, mobility: 0, mood: 0
        };

        relevantSymptoms.forEach(symptom => {
            regionStats[symptom.region] = (regionStats[symptom.region] || 0) + 1;
            typeStats[symptom.type] = (typeStats[symptom.type] || 0) + 1;
            severityStats.push(symptom.severity);
            
            // Count life impact
            if (symptom.lifeImpact) {
                Object.keys(impactStats).forEach(category => {
                    if (symptom.lifeImpact[category] && symptom.lifeImpact[category] !== 'none') {
                        impactStats[category]++;
                    }
                });
            }
        });

        // Sleep correlation
        let sleepCorrelation = null;
        if (this.sleepEntries.length >= 3) {
            sleepCorrelation = this.analyzeSleepSymptomCorrelation();
        }

        return {
            timeframe: timeframe,
            symptoms: relevantSymptoms,
            totalCount: relevantSymptoms.length,
            avgSeverity: relevantSymptoms.length > 0 ? 
                (relevantSymptoms.reduce((sum, s) => sum + s.severity, 0) / relevantSymptoms.length).toFixed(1) : 0,
            regionStats: regionStats,
            typeStats: typeStats,
            maxSeverity: Math.max(...severityStats, 0),
            minSeverity: Math.min(...severityStats, 0),
            impactStats: impactStats,
            sleepCorrelation: sleepCorrelation
        };
    }

    showReportPreview(data) {
        const preview = document.getElementById('report-preview');
        if (!preview) return;

        const timeframeLabels = {
            '2weeks': 'Last 2 weeks',
            '1month': 'Last month', 
            '3months': 'Last 3 months',
            '6months': 'Last 6 months',
            'all': 'All time'
        };

        const topRegion = Object.keys(data.regionStats).length > 0 ? 
            Object.keys(data.regionStats).reduce((a, b) => 
                data.regionStats[a] > data.regionStats[b] ? a : b, 'none'
            ) : 'none';
        
        const topType = Object.keys(data.typeStats).length > 0 ?
            Object.keys(data.typeStats).reduce((a, b) => 
                data.typeStats[a] > data.typeStats[b] ? a : b, 'none'
            ) : 'none';

        // Find most impacted life areas
        const significantImpacts = Object.entries(data.impactStats)
            .filter(([key, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        preview.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="color: #c4b5fd; margin-bottom: 20px; font-size: 1.2rem;">
                    Medical Report Summary - ${timeframeLabels[data.timeframe]}
                </h4>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center; background: rgba(79, 172, 254, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: #4facfe;">${data.totalCount}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Total Symptoms</div>
                    </div>
                    <div style="text-align: center; background: rgba(245, 87, 108, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: #f093fb;">${data.avgSeverity}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Avg Severity</div>
                    </div>
                    <div style="text-align: center; background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: #ef4444;">${data.maxSeverity}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Peak Severity</div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
                    <h5 style="color: #c4b5fd; margin-bottom: 15px;">Key Points for Healthcare Provider:</h5>
                    <ul style="color: rgba(255,255,255,0.9); line-height: 1.8; padding-left: 20px;">
                        ${data.totalCount > 0 ? `
                            <li><strong>Most affected area:</strong> ${topRegion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} (${data.regionStats[topRegion] || 0} occurrences)</li>
                            <li><strong>Most common symptom:</strong> ${topType} (${data.typeStats[topType] || 0} times)</li>
                            <li><strong>Pain range:</strong> ${data.minSeverity}/10 to ${data.maxSeverity}/10 (average: ${data.avgSeverity}/10)</li>
                            ${significantImpacts.length > 0 ? `
                                <li><strong>Life impact areas:</strong> ${significantImpacts.map(([area, count]) => `${area} (${count} times)`).join(', ')}</li>
                            ` : ''}
                            ${data.sleepCorrelation ? `
                                <li><strong>Sleep correlation:</strong> Potential connection between sleep quality and symptom severity detected</li>
                            ` : ''}
                        ` : '<li>No symptoms in selected time period</li>'}
                    </ul>
                </div>
            </div>
            
            <button class="btn-primary" onclick="window.symptomTracker.downloadMedicalReport()" style="width: 100%;">
                <span class="btn-icon">📥</span>
                Download Complete Medical Report (PDF)
            </button>
        `;
    }

    async downloadMedicalReport() {
        if (this.symptoms.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        this.showLoadingOverlay(true);

        try {
            // Check if jsPDF is available
            if (typeof window.jsPDF === 'undefined') {
                console.log('jsPDF not found, falling back to text export');
                this.downloadTextReport();
                return;
            }

            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            const timeframe = document.getElementById('report-timeframe')?.value || '1month';
            const reportData = this.getReportData(timeframe);
            
            // Generate PDF with images
            await this.generatePDFWithImages(doc, reportData);
            
            // Save the PDF
            const fileName = `medical-report-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            this.showToast('PDF report with images generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showToast('PDF generation failed, downloading text version', 'error');
            this.downloadTextReport();
        } finally {
            this.showLoadingOverlay(false);
        }
    }

    // New method to generate PDF with images
    async generatePDFWithImages(doc, data) {
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        // Helper function to check if we need a new page
        const checkNewPage = (spaceNeeded = 30) => {
            if (yPosition + spaceNeeded > pageHeight - margin) {
                doc.addPage();
                yPosition = 20;
            }
        };

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('MEDICAL SYMPTOM REPORT', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        // Report info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
        yPosition += 8;
        doc.text(`Time Period: ${this.getTimeframeLabel(data.timeframe)}`, margin, yPosition);
        yPosition += 8;
        doc.text(`Patient: ${this.currentUser?.email || 'Demo User'}`, margin, yPosition);
        yPosition += 20;

        // Summary section
        checkNewPage(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SUMMARY STATISTICS', margin, yPosition);
        yPosition += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Symptoms: ${data.totalCount}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Average Severity: ${data.avgSeverity}/10`, margin, yPosition);
        yPosition += 6;
        doc.text(`Severity Range: ${data.minSeverity}/10 - ${data.maxSeverity}/10`, margin, yPosition);
        yPosition += 20;

        // Symptoms with photos
        const symptomsWithPhotos = data.symptoms.filter(s => s.photoBase64).slice(0, 3);
        const symptomsWithoutPhotos = data.symptoms.filter(s => !s.photoBase64).slice(0, 5);
        
        if (symptomsWithPhotos.length > 0) {
            checkNewPage(50);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('SYMPTOMS WITH PHOTOS', margin, yPosition);
            yPosition += 15;

            for (const symptom of symptomsWithPhotos) {
                checkNewPage(80);

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(new Date(symptom.datetime).toLocaleDateString(), margin, yPosition);
                yPosition += 8;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Location: ${symptom.region.replace('-', ' ')}`, margin + 5, yPosition);
                yPosition += 6;
                doc.text(`Type: ${symptom.type} | Severity: ${symptom.severity}/10`, margin + 5, yPosition);
                yPosition += 6;
                
                const description = `Description: ${symptom.description}`;
                const splitDescription = doc.splitTextToSize(description, pageWidth - 2 * margin - 60);
                doc.text(splitDescription, margin + 5, yPosition);
                yPosition += splitDescription.length * 6;

                if (symptom.photoBase64) {
                    try {
                        yPosition += 5;
                        doc.text('Photo:', margin + 5, yPosition);
                        yPosition += 8;
                        
                        doc.addImage(symptom.photoBase64, 'JPEG', margin + 5, yPosition, 50, 40);
                        yPosition += 45;
                    } catch (imageError) {
                        console.error('Error adding image:', imageError);
                        doc.text('[Photo could not be processed]', margin + 5, yPosition);
                        yPosition += 8;
                    }
                }
                
                yPosition += 10;
            }
        }

        // Regular symptoms (without photos)
        if (symptomsWithoutPhotos.length > 0) {
            checkNewPage(50);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('RECENT SYMPTOMS', margin, yPosition);
            yPosition += 15;

            symptomsWithoutPhotos.forEach(symptom => {
                checkNewPage(25);

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(`${new Date(symptom.datetime).toLocaleDateString()} - ${symptom.region.replace('-', ' ')}`, margin, yPosition);
                yPosition += 6;

                doc.setFont('helvetica', 'normal');
                doc.text(`${symptom.type} (Severity: ${symptom.severity}/10)`, margin + 5, yPosition);
                yPosition += 6;
                
                const description = doc.splitTextToSize(symptom.description, pageWidth - 2 * margin - 10);
                doc.text(description, margin + 5, yPosition);
                yPosition += description.length * 6 + 8;
            });
        }

        // Disclaimer
        checkNewPage(30);
        yPosition += 10;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const disclaimer = 'This report is generated from self-reported symptom data and is intended to assist healthcare providers. Not for self-diagnosis.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
        doc.text(disclaimerLines, margin, yPosition);
    }

    // Text fallback method
    downloadTextReport() {
        const timeframe = document.getElementById('report-timeframe')?.value || '1month';
        const reportData = this.getReportData(timeframe);
        
        let content = `MEDICAL SYMPTOM REPORT
Generated: ${new Date().toLocaleString()}
Time Period: ${this.getTimeframeLabel(timeframe)}
Patient: ${this.currentUser?.email || 'Demo User'}

SUMMARY STATISTICS
==================
Total Symptoms: ${reportData.totalCount}
Average Severity: ${reportData.avgSeverity}/10
Severity Range: ${reportData.minSeverity}/10 - ${reportData.maxSeverity}/10

DETAILED SYMPTOM LOG
===================
`;

        reportData.symptoms
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
            .slice(0, 10)
            .forEach((symptom, index) => {
                content += `
${index + 1}. ${new Date(symptom.datetime).toLocaleString()}
Location: ${symptom.region.replace('-', ' ')}
Type: ${symptom.type}
Severity: ${symptom.severity}/10
Description: ${symptom.description}
${symptom.notes ? `Notes: ${symptom.notes}` : ''}
${symptom.photoBase64 ? '[Photo included in PDF version]' : ''}
`;
            });

        content += `
==================
This report contains ${reportData.totalCount} total symptoms.
For complete data with photos, use PDF export.

Generated by MedPrep Tracker`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Helper method for timeframe labels
    getTimeframeLabel(timeframe) {
        const labels = {
            '2weeks': 'Last 2 weeks',
            '1month': 'Last month', 
            '3months': 'Last 3 months',
            '6months': 'Last 6 months',
            'all': 'All time'
        };
        return labels[timeframe] || 'Unknown period';
    }

    showLoadingOverlay(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    quickLogSymptom() {
        this.switchTab('tracker');
        this.showToast('Click on a body part to quickly log a symptom!');
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        this.currentTab = tabName;

        if (tabName === 'history') {
            this.renderHistory();
            this.generatePatternInsights();
        } else if (tabName === 'sleep') {
            this.renderSleepHistory();
            this.updateSleepQualityDisplay();
        }
    }

    // FIXED: Photo upload with proper validation
    async uploadPhoto(file) {
        if (!file) return null;
        
        // Validate the file before processing
        const validation = this.validatePhotoUpload(file);
        if (!validation.valid) {
            this.showToast(validation.message, 'error');
            return null;
        }
        
        try {
            // Convert to base64
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64String = e.target.result;
                    resolve(base64String);
                };
                reader.onerror = function(error) {
                    console.error('Error reading file:', error);
                    reject(error);
                };
                reader.readAsDataURL(file);
            });

        } catch (error) {
            console.error('Error processing photo:', error);
            this.showToast('Failed to process photo', 'error');
            return null;
        }
    }

    // FIXED: Save symptom with proper photo limit checking
    async saveSymptom() {
        if (!this.currentUser) {
            this.showToast('Please sign in to save symptoms', 'error');
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        const photoFile = document.getElementById('symptom-photo')?.files[0];
        
        // Validate photo if one is selected
        if (photoFile) {
            const validation = this.validatePhotoUpload(photoFile);
            if (!validation.valid) {
                this.showToast(validation.message, 'error');
                return;
            }
        }

        const type = document.getElementById('symptom-type')?.value;
        const description = document.getElementById('symptom-description')?.value;
        const severity = document.getElementById('severity')?.value;
        const time = document.getElementById('symptom-time')?.value;
        const notes = document.getElementById('symptom-notes')?.value;

        // Get life impact data
        const impactData = this.getLifeImpactData();

        try {
            const saveButton = document.querySelector('.btn-primary');
            const originalContent = saveButton.innerHTML;
            saveButton.disabled = true;
            saveButton.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; margin: 0;"></div> Saving...';

            // Convert photo to base64 if exists
            let photoBase64 = null;
            if (photoFile) {
                saveButton.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; margin: 0;"></div> Processing photo...';
                photoBase64 = await this.uploadPhoto(photoFile);
                if (photoBase64 === null && photoFile) {
                    saveButton.disabled = false;
                    saveButton.innerHTML = originalContent;
                    return;
                }
            }

            const symptom = {
                userId: this.currentUser.uid,
                region: this.selectedRegion,
                type: type,
                description: description,
                severity: parseInt(severity),
                datetime: time,
                notes: notes,
                lifeImpact: impactData,
                photoBase64: photoBase64,
                photoFileName: photoFile ? photoFile.name : null,
                created: new Date().toISOString()
            };

            const { collection, addDoc } = window.firebaseOperations;
            const docRef = await addDoc(collection(window.db, 'symptoms'), symptom);
            
            this.symptoms.unshift({
                id: docRef.id,
                ...symptom
            });

            this.showToast('Symptom logged successfully!');
            this.clearForm();
            this.updateStats();
            this.renderHistory();
            this.generatePatternInsights();
            
            // Update photo limit status after adding new symptom
            this.updatePhotoLimitStatus();

            saveButton.disabled = false;
            saveButton.innerHTML = originalContent;

        } catch (error) {
            console.error('Error saving symptom:', error);
            this.showToast('Failed to save symptom. Please try again.', 'error');
            
            const saveButton = document.querySelector('.btn-primary');
            saveButton.disabled = false;
            saveButton.innerHTML = '<span class="btn-icon">💾</span>Log Symptom';
        }
    }

    // Delete individual symptom
    async deleteSymptom(symptomId) {
        if (!this.currentUser) {
            this.showToast('Please sign in to delete symptoms', 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this symptom? This action cannot be undone.')) {
            return;
        }

        try {
            const { doc, deleteDoc } = window.firebaseOperations;
            await deleteDoc(doc(window.db, 'symptoms', symptomId));
            
            // Remove from local array
            this.symptoms = this.symptoms.filter(s => s.id !== symptomId);
            
            this.showToast('Symptom deleted successfully!');
            this.updateStats();
            this.renderHistory();
            this.generatePatternInsights();
            
            // Update photo limit status after deletion
            this.updatePhotoLimitStatus();
            
        } catch (error) {
            console.error('Error deleting symptom:', error);
            this.showToast('Failed to delete symptom', 'error');
        }
    }

    // Bulk delete all user data
    async deleteAllUserData() {
        if (!this.currentUser) {
            this.showToast('Please sign in first', 'error');
            return;
        }

        const confirmText = 'DELETE';
        const userInput = prompt(`This will permanently delete ALL your health data including ${this.symptoms.length} symptoms, ${this.appointments.length} appointments, and ${this.sleepEntries.length} sleep entries. This cannot be undone.\n\nType "${confirmText}" to confirm:`);
        
        if (userInput !== confirmText) {
            this.showToast('Deletion cancelled', 'error');
            return;
        }

        this.showLoadingOverlay(true);

        try {
            const { collection, query, where, getDocs, deleteDoc, doc } = window.firebaseOperations;
            let deletedCount = 0;

            // Delete all symptoms
            const symptomsQuery = query(
                collection(window.db, 'symptoms'),
                where('userId', '==', this.currentUser.uid)
            );
            const symptomsSnapshot = await getDocs(symptomsQuery);
            for (const docSnapshot of symptomsSnapshot.docs) {
                await deleteDoc(doc(window.db, 'symptoms', docSnapshot.id));
                deletedCount++;
            }

            // Delete all appointments
            const appointmentsQuery = query(
                collection(window.db, 'appointments'),
                where('userId', '==', this.currentUser.uid)
            );
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            for (const docSnapshot of appointmentsSnapshot.docs) {
                await deleteDoc(doc(window.db, 'appointments', docSnapshot.id));
                deletedCount++;
            }

            // Delete all sleep entries
            const sleepQuery = query(
                collection(window.db, 'sleep'),
                where('userId', '==', this.currentUser.uid)
            );
            const sleepSnapshot = await getDocs(sleepQuery);
            for (const docSnapshot of sleepSnapshot.docs) {
                await deleteDoc(doc(window.db, 'sleep', docSnapshot.id));
                deletedCount++;
            }

            // Clear local arrays
            this.symptoms = [];
            this.appointments = [];
            this.sleepEntries = [];

            this.updateStats();
            this.renderHistory();
            this.renderSleepHistory();
            this.generatePatternInsights();
            
            // Update photo limit status after clearing all data
            this.updatePhotoLimitStatus();

            this.showToast(`Successfully deleted all ${deletedCount} records`, 'success');

        } catch (error) {
            console.error('Error deleting user data:', error);
            this.showToast('Failed to delete some data. Please try again.', 'error');
        } finally {
            this.showLoadingOverlay(false);
        }
    }
}

// Global functions for HTML onclick handlers
function switchTab(tabName) {
    if (window.symptomTracker) {
        window.symptomTracker.switchTab(tabName);
    }
}

function saveSymptom() {
    if (window.symptomTracker) {
        window.symptomTracker.saveSymptom();
    }
}

function saveSleep() {
    if (window.symptomTracker) {
        window.symptomTracker.saveSleep();
    }
}

function clearForm() {
    if (window.symptomTracker) {
        window.symptomTracker.clearForm();
    }
}

function saveAppointment() {
    if (window.symptomTracker) {
        window.symptomTracker.saveAppointment();
    }
}

function addQuestion() {
    if (window.symptomTracker) {
        window.symptomTracker.addQuestion();
    }
}

function generateVisitSummary() {
    if (window.symptomTracker) {
        window.symptomTracker.generateVisitSummary();
    }
}

function filterHistory() {
    if (window.symptomTracker) {
        window.symptomTracker.filterHistory();
    }
}

function generateReport() {
    if (window.symptomTracker) {
        window.symptomTracker.generateReport();
    }
}

function quickLogSymptom() {
    if (window.symptomTracker) {
        window.symptomTracker.quickLogSymptom();
    }
}

function exportSleepData() {
    if (window.symptomTracker) {
        window.symptomTracker.exportSleepData();
    }
}

function exportLifeImpactData() {
    if (window.symptomTracker) {
        window.symptomTracker.exportLifeImpactData();
    }
}

function downloadMedicalReport() {
    if (window.symptomTracker) {
        window.symptomTracker.downloadMedicalReport();
    }
}

function deleteSymptom(symptomId) {
    if (window.symptomTracker) {
        window.symptomTracker.deleteSymptom(symptomId);
    }
}

function deleteAllUserData() {
    if (window.symptomTracker) {
        window.symptomTracker.deleteAllUserData();
    }
}

// FIXED: Photo handling functions with validation
function handlePhotoSelect(input) {
    const file = input.files[0];
    const warningElement = document.getElementById('photo-size-warning');
    const metaElement = document.getElementById('photo-meta');
    
    if (!file) return;

    // Check if symptom tracker is available and validate
    if (window.symptomTracker) {
        const validation = window.symptomTracker.validatePhotoUpload(file);
        if (!validation.valid) {
            input.value = ''; // Clear the input
            window.symptomTracker.showToast(validation.message, 'error');
            return;
        }
    }

    // Show file size warning if needed (but allow files under 1MB)
    if (file.size > 1024 * 1024) {
        warningElement.style.display = 'block';
        warningElement.style.color = '#ef4444';
        warningElement.innerHTML = '⚠️ File too large! Please choose an image under 1MB';
        input.value = ''; // Clear the input
        return;
    } else if (warningElement) {
        warningElement.style.display = 'none';
    }
    
    // Show file info
    if (metaElement) {
        const fileSizeKB = Math.round(file.size / 1024);
        metaElement.textContent = `${file.name} (${fileSizeKB}KB)`;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('photo-preview');
        const image = document.getElementById('preview-image');
        if (image && preview) {
            image.src = e.target.result;
            preview.style.display = 'flex';
        }
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    const input = document.getElementById('symptom-photo');
    const preview = document.getElementById('photo-preview');
    const warningElement = document.getElementById('photo-size-warning');
    
    if (input) input.value = '';
    if (preview) preview.style.display = 'none';
    if (warningElement) warningElement.style.display = 'none';
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.symptomTracker = new SymptomTracker();
    console.log('Enhanced MedPrep Tracker with Fixed Photo Limit Logic loaded successfully!');
});