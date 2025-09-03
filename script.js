// Enhanced Symptom Tracker Application with Life Impact and Sleep Tracking
class SymptomTracker {
    constructor() {
        this.symptoms = [];
        this.appointments = [];
        this.sleepEntries = [];
        this.selectedRegion = null;
        this.currentTab = 'tracker';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSeverityDisplay();
        this.updateFilterOptions();
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

    // NEW: Get Life Impact Data from form
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

    // NEW: Update sleep quality display
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

    async saveSymptom() {
        if (!this.currentUser) {
            this.showToast('Please sign in to save symptoms', 'error');
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        const type = document.getElementById('symptom-type')?.value;
        const description = document.getElementById('symptom-description')?.value;
        const severity = document.getElementById('severity')?.value;
        const time = document.getElementById('symptom-time')?.value;
        const notes = document.getElementById('symptom-notes')?.value;

        // Get life impact data
        const impactData = this.getLifeImpactData();

        const symptom = {
            userId: this.currentUser.uid,
            region: this.selectedRegion,
            type: type,
            description: description,
            severity: parseInt(severity),
            datetime: time,
            notes: notes,
            lifeImpact: impactData,
            created: new Date().toISOString()
        };

        try {
            const saveButton = document.querySelector('.btn-primary');
            const originalContent = saveButton.innerHTML;
            saveButton.disabled = true;
            saveButton.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; margin: 0;"></div> Saving...';

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

    // NEW: Save sleep entry
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

    // NEW: Render sleep history
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

    // NEW: Get sleep quality color
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

    // NEW: Analyze life impact patterns
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

    // NEW: Analyze sleep-symptom correlation
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

    // NEW: Export sleep data as CSV
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

    // NEW: Export life impact data as CSV
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
            timeline.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 40px;">No symptoms logged yet. Start by clicking on the body map!</p>';
            return;
        }

        const sortedSymptoms = [...this.symptoms].sort((a, b) => 
            new Date(b.datetime) - new Date(a.datetime)
        );

        timeline.innerHTML = sortedSymptoms.map(symptom => {
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

            return `
                <div class="timeline-item" style="
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                    border-left: 4px solid ${this.getSeverityColor(symptom.severity)};
                    transition: all 0.3s ease;
                    cursor: pointer;
                " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
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

    // NEW: Analyze life impact for visit summary
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

    generateReport() {
        const timeframe = document.getElementById('report-timeframe')?.value;
        const preview = document.getElementById('report-preview');
        
        if (!preview) return;

        if (this.symptoms.length === 0) {
            this.showToast('No symptoms to generate report from', 'error');
            return;
        }

        this.showLoadingOverlay(true);

        setTimeout(() => {
            const reportData = this.getReportData(timeframe);
            this.showReportPreview(reportData);
            this.showLoadingOverlay(false);
            this.showToast('Report generated successfully!');
        }, 1500);
    }

    getReportData(timeframe) {
        const days = {
            '1week': 7,
            '2weeks': 14,
            '1month': 30,
            '3months': 90,
            '6months': 180
        };

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days[timeframe]);

        const relevantSymptoms = this.symptoms.filter(symptom => 
            new Date(symptom.datetime) >= cutoffDate
        );

        const regionStats = {};
        const typeStats = {};
        const severityStats = [];

        relevantSymptoms.forEach(symptom => {
            regionStats[symptom.region] = (regionStats[symptom.region] || 0) + 1;
            typeStats[symptom.type] = (typeStats[symptom.type] || 0) + 1;
            severityStats.push(symptom.severity);
        });

        return {
            timeframe: timeframe,
            symptoms: relevantSymptoms,
            totalCount: relevantSymptoms.length,
            avgSeverity: relevantSymptoms.length > 0 ? 
                (relevantSymptoms.reduce((sum, s) => sum + s.severity, 0) / relevantSymptoms.length).toFixed(1) : 0,
            regionStats: regionStats,
            typeStats: typeStats,
            maxSeverity: Math.max(...severityStats, 0),
            minSeverity: Math.min(...severityStats, 0)
        };
    }

    showReportPreview(data) {
        const preview = document.getElementById('report-preview');
        if (!preview) return;

        const topRegion = Object.keys(data.regionStats).reduce((a, b) => 
            data.regionStats[a] > data.regionStats[b] ? a : b, 'none'
        );
        const topType = Object.keys(data.typeStats).reduce((a, b) => 
            data.typeStats[a] > data.typeStats[b] ? a : b, 'none'
        );

        preview.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="color: #c4b5fd; margin-bottom: 15px;">Medical Report Summary</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #4facfe;">${data.totalCount}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Total Symptoms</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #f093fb;">${data.avgSeverity}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Avg Severity</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #ef4444;">${data.maxSeverity}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Peak Severity</div>
                    </div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 8px;">
                        <strong>Most affected region:</strong> ${topRegion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} (${data.regionStats[topRegion] || 0} times)
                    </p>
                    <p style="color: rgba(255,255,255,0.8);">
                        <strong>Most common type:</strong> ${topType} (${data.typeStats[topType] || 0} times)
                    </p>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" onclick="downloadReportPDF()" style="flex: 1;">
                    <span class="btn-icon">📥</span>
                    Download PDF Report
                </button>
                <button class="btn-secondary" onclick="window.symptomTracker.exportLifeImpactData()">
                    Export Impact Data
                </button>
            </div>
        `;
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

function downloadReportPDF() {
    if (window.symptomTracker) {
        window.symptomTracker.generatePDFReport();
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.symptomTracker = new SymptomTracker();
    console.log('Enhanced MedPrep Tracker with Life Impact and Sleep Tracking loaded successfully!');
});