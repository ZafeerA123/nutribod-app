// Symptom Tracker Application with Complete Functionality
class SymptomTracker {
    constructor() {
        this.symptoms = [];
        this.appointments = [];
        this.selectedRegion = null;
        this.currentTab = 'tracker';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSeverityDisplay();
        this.updateFilterOptions();
        console.log('MedPrep Tracker initialized successfully!');
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

        // Set default datetime to now
        const timeInput = document.getElementById('symptom-time');
        if (timeInput) {
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            timeInput.value = localDateTime;
        }

        // Form validation listeners
        this.setupFormValidation();
    }

    // FIX 1: Complete Form Validation
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

        // Remove existing error styling
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

        // Add error message
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

    // FIX 2: Update Filter Options to Include All Body Regions
    updateFilterOptions() {
        const filterSelect = document.getElementById('filter-region');
        if (!filterSelect) return;

        // Get all unique body regions from the SVG
        const bodyRegions = [
            'head', 'neck', 'left-shoulder', 'right-shoulder', 'left-upper-arm', 'right-upper-arm',
            'left-elbow', 'right-elbow', 'left-forearm', 'right-forearm', 'left-hand', 'right-hand',
            'chest', 'abdomen', 'lower-back', 'pelvis', 'left-thigh', 'right-thigh',
            'left-knee', 'right-knee', 'left-calf', 'right-calf', 'left-ankle', 'right-ankle',
            'left-foot', 'right-foot'
        ];

        // Clear existing options except the first one
        filterSelect.innerHTML = '<option value="">All body regions</option>';

        // Add all regions
        bodyRegions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            filterSelect.appendChild(option);
        });
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

            this.updateStats();
            this.renderHistory();
            this.generatePatternInsights(); // FIX 3: Generate real patterns
            console.log(`Loaded ${this.symptoms.length} symptoms and ${this.appointments.length} appointments for user`);

        } catch (error) {
            console.error('Error loading user data:', error);
            this.showToast('Error loading your data', 'error');
        }
    }

    selectBodyPart(region) {
        // Remove previous selections
        document.querySelectorAll('.body-part.selected').forEach(part => {
            part.classList.remove('selected');
        });

        // Add selection to clicked part
        const selectedPart = document.querySelector(`[data-region="${region}"]`);
        if (selectedPart) {
            selectedPart.classList.add('selected');
        }

        // Show form
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

        // Focus on first input
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

        // Update severity label
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

        // Update slider color based on severity
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

    async saveSymptom() {
        if (!this.currentUser) {
            this.showToast('Please sign in to save symptoms', 'error');
            return;
        }

        // FIX 1: Complete form validation
        if (!this.validateForm()) {
            return;
        }

        const type = document.getElementById('symptom-type')?.value;
        const description = document.getElementById('symptom-description')?.value;
        const severity = document.getElementById('severity')?.value;
        const time = document.getElementById('symptom-time')?.value;
        const notes = document.getElementById('symptom-notes')?.value;

        const symptom = {
            userId: this.currentUser.uid,
            region: this.selectedRegion,
            type: type,
            description: description,
            severity: parseInt(severity),
            datetime: time,
            notes: notes,
            created: new Date().toISOString()
        };

        try {
            // Show loading state
            const saveButton = document.querySelector('.btn-primary');
            const originalContent = saveButton.innerHTML;
            saveButton.disabled = true;
            saveButton.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; margin: 0;"></div> Saving...';

            const { collection, addDoc } = window.firebaseOperations;
            const docRef = await addDoc(collection(window.db, 'symptoms'), symptom);
            
            // Add to local array with the new ID
            this.symptoms.unshift({
                id: docRef.id,
                ...symptom
            });

            this.showToast('Symptom logged successfully!');
            this.clearForm();
            this.updateStats();
            this.renderHistory();
            this.generatePatternInsights(); // Update patterns

            // Restore button
            saveButton.disabled = false;
            saveButton.innerHTML = originalContent;

        } catch (error) {
            console.error('Error saving symptom:', error);
            this.showToast('Failed to save symptom. Please try again.', 'error');
            
            // Restore button
            const saveButton = document.querySelector('.btn-primary');
            saveButton.disabled = false;
            saveButton.innerHTML = '<span class="btn-icon">💾</span>Log Symptom';
        }
    }

    // FIX 3: Real Pattern Detection Analysis
    generatePatternInsights() {
        const insightsDiv = document.getElementById('pattern-insights');
        if (!insightsDiv || this.symptoms.length < 3) {
            if (insightsDiv) {
                insightsDiv.innerHTML = '<p class="no-data">Log at least 3 symptoms to see patterns</p>';
            }
            return;
        }

        // Analyze patterns in the data
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

        // Pattern 2: Severity trends
        const recentSymptoms = this.symptoms.slice(0, 10); // Last 10 symptoms
        if (recentSymptoms.length >= 5) {
            const avgRecentSeverity = recentSymptoms.reduce((sum, s) => sum + s.severity, 0) / recentSymptoms.length;
            const overallAvg = this.symptoms.reduce((sum, s) => sum + s.severity, 0) / this.symptoms.length;
            
            if (avgRecentSeverity > overallAvg + 1) {
                patterns.push({
                    title: 'Increasing Severity Trend',
                    description: `Your recent symptoms (${avgRecentSeverity.toFixed(1)}/10) are more severe than your overall average (${overallAvg.toFixed(1)}/10). This upward trend may warrant medical attention.`,
                    confidence: 'High',
                    color: '#ef4444'
                });
            } else if (avgRecentSeverity < overallAvg - 1) {
                patterns.push({
                    title: 'Improving Trend',
                    description: `Your recent symptoms (${avgRecentSeverity.toFixed(1)}/10) are less severe than your overall average (${overallAvg.toFixed(1)}/10). You may be on a positive trajectory.`,
                    confidence: 'Medium',
                    color: '#22c55e'
                });
            }
        }

        // Pattern 3: Time-based patterns
        const timePatterns = this.analyzeTimePatterns();
        patterns.push(...timePatterns);

        // Pattern 4: Symptom type clustering
        const typeCounts = {};
        this.symptoms.forEach(symptom => {
            typeCounts[symptom.type] = (typeCounts[symptom.type] || 0) + 1;
        });

        const dominantType = Object.keys(typeCounts).reduce((a, b) => 
            typeCounts[a] > typeCounts[b] ? a : b, ''
        );

        if (typeCounts[dominantType] >= 3) {
            patterns.push({
                title: 'Recurring Symptom Type',
                description: `You frequently experience ${dominantType} symptoms (${typeCounts[dominantType]} occurrences). Consider tracking potential triggers.`,
                confidence: typeCounts[dominantType] >= 5 ? 'High' : 'Medium',
                color: '#8b5cf6'
            });
        }

        return patterns.slice(0, 4); // Limit to 4 most significant patterns
    }

    analyzeTimePatterns() {
        const patterns = [];
        
        // Group symptoms by hour of day
        const hourCounts = {};
        this.symptoms.forEach(symptom => {
            const hour = new Date(symptom.datetime).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        // Find peak hours
        const maxCount = Math.max(...Object.values(hourCounts));
        const peakHours = Object.keys(hourCounts).filter(hour => hourCounts[hour] === maxCount);

        if (maxCount >= 3 && peakHours.length <= 2) {
            const timeRange = peakHours.map(h => {
                const hour12 = h % 12 || 12;
                const ampm = h < 12 ? 'AM' : 'PM';
                return `${hour12}:00 ${ampm}`;
            }).join(' and ');

            patterns.push({
                title: 'Time-Based Pattern',
                description: `Your symptoms often occur around ${timeRange} (${maxCount} occurrences). Consider what activities or meals happen around this time.`,
                confidence: maxCount >= 4 ? 'High' : 'Medium',
                color: '#06b6d4'
            });
        }

        return patterns;
    }

    clearForm() {
        // Clear form inputs
        const inputs = ['symptom-type', 'symptom-description', 'symptom-notes'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
                this.clearFieldError(id); // Clear any validation errors
            }
        });

        // Reset severity slider
        const severitySlider = document.getElementById('severity');
        if (severitySlider) {
            severitySlider.value = 5;
            this.updateSeverityDisplay(5);
        }

        // Reset datetime to now
        const timeInput = document.getElementById('symptom-time');
        if (timeInput) {
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            timeInput.value = localDateTime;
        }

        // Hide form and show instruction
        const form = document.getElementById('symptom-form');
        const instruction = document.getElementById('instruction-text');
        
        if (form) form.style.display = 'none';
        if (instruction) instruction.style.display = 'block';

        // Clear body part selection
        document.querySelectorAll('.body-part.selected').forEach(part => {
            part.classList.remove('selected');
        });

        this.selectedRegion = null;
    }

    updateStats() {
        const totalElement = document.getElementById('total-symptoms');
        const weekElement = document.getElementById('this-week');

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
    }

    renderHistory() {
        const timeline = document.getElementById('symptom-timeline');
        if (!timeline) return;

        if (this.symptoms.length === 0) {
            timeline.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 40px;">No symptoms logged yet. Start by clicking on the body map!</p>';
            return;
        }

        // Sort symptoms by date (newest first)
        const sortedSymptoms = [...this.symptoms].sort((a, b) => 
            new Date(b.datetime) - new Date(a.datetime)
        );

        timeline.innerHTML = sortedSymptoms.map(symptom => `
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
                ${symptom.notes ? `<p style="color: rgba(255,255,255,0.7); font-style: italic; margin-top: 10px;">Notes: ${symptom.notes}</p>` : ''}
            </div>
        `).join('');
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

        // Update message and icon
        toastMessage.textContent = message;
        toastIcon.textContent = type === 'error' ? '❌' : '✅';

        // Update colors
        if (type === 'error') {
            toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else {
            toast.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
        }

        // Show toast
        toast.classList.add('show');

        // Hide after 3 seconds
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

        // Get recent symptoms (last 2 weeks)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const recentSymptoms = this.symptoms.filter(symptom => 
            new Date(symptom.datetime) >= twoWeeksAgo
        );

        // Generate summary
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
                    ` : '<li>No recent symptoms to summarize</li>'}
                </ul>
            </div>
        `;
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
        
        // Show filter results message
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

        timeline.innerHTML = sortedSymptoms.map(symptom => `
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
                ${symptom.notes ? `<p style="color: rgba(255,255,255,0.7); font-style: italic; margin-top: 10px;">Notes: ${symptom.notes}</p>` : ''}
            </div>
        `).join('');
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

        // Generate real report data
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

        // Calculate additional statistics
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
            <button class="btn-primary" onclick="downloadReportPDF()" style="width: 100%;">
                <span class="btn-icon">📥</span>
                Download PDF Report
            </button>
        `;
    }

    // FIX 4: Real PDF Generation
    async generatePDFReport() {
        const timeframe = document.getElementById('report-timeframe')?.value || '1month';
        const reportData = this.getReportData(timeframe);
        
        if (reportData.totalCount === 0) {
            this.showToast('No symptoms found for the selected timeframe', 'error');
            return;
        }

        // Create PDF content
        const pdfContent = this.createPDFContent(reportData);
        
        // Generate PDF using browser's print functionality
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>MedPrep Tracker - Medical Report</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 40px; 
                        line-height: 1.6; 
                        color: #333;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #667eea; 
                        padding-bottom: 20px; 
                        margin-bottom: 30px; 
                    }
                    .section { 
                        margin-bottom: 25px; 
                        padding: 15px; 
                        border-left: 3px solid #667eea; 
                        background: #f8f9fa; 
                    }
                    .symptom-item { 
                        border: 1px solid #ddd; 
                        padding: 15px; 
                        margin-bottom: 10px; 
                        border-radius: 5px; 
                    }
                    .stats-grid { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                        gap: 15px; 
                        margin: 20px 0; 
                    }
                    .stat-box { 
                        text-align: center; 
                        padding: 15px; 
                        background: #e3f2fd; 
                        border-radius: 5px; 
                    }
                    .disclaimer { 
                        background: #fff3cd; 
                        border: 1px solid #ffeaa7; 
                        padding: 15px; 
                        border-radius: 5px; 
                        margin-top: 30px; 
                        font-size: 0.9rem; 
                    }
                    @media print { 
                        body { margin: 20px; } 
                        .no-print { display: none; } 
                    }
                </style>
            </head>
            <body>
                ${pdfContent}
                <div class="no-print" style="text-align: center; margin-top: 30px;">
                    <button onclick="window.print()" style="
                        background: #667eea; 
                        color: white; 
                        border: none; 
                        padding: 12px 24px; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        font-size: 16px;
                    ">Print/Save as PDF</button>
                    <button onclick="window.close()" style="
                        background: #6c757d; 
                        color: white; 
                        border: none; 
                        padding: 12px 24px; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        font-size: 16px; 
                        margin-left: 10px;
                    ">Close</button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
    }

    createPDFContent(reportData) {
        const patientName = this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'Patient';
        const reportDate = new Date().toLocaleDateString();
        const timeframeText = {
            '1week': 'Last Week',
            '2weeks': 'Last 2 Weeks', 
            '1month': 'Last Month',
            '3months': 'Last 3 Months',
            '6months': 'Last 6 Months'
        };

        const topRegion = Object.keys(reportData.regionStats).reduce((a, b) => 
            reportData.regionStats[a] > reportData.regionStats[b] ? a : b, 'none'
        );
        const topType = Object.keys(reportData.typeStats).reduce((a, b) => 
            reportData.typeStats[a] > reportData.typeStats[b] ? a : b, 'none'
        );

        return `
            <div class="header">
                <h1>MedPrep Tracker - Medical Report</h1>
                <p><strong>Patient:</strong> ${patientName}</p>
                <p><strong>Report Period:</strong> ${timeframeText[reportData.timeframe]} (${reportDate})</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="section">
                <h2>Summary Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-box">
                        <h3>${reportData.totalCount}</h3>
                        <p>Total Symptoms</p>
                    </div>
                    <div class="stat-box">
                        <h3>${reportData.avgSeverity}/10</h3>
                        <p>Average Severity</p>
                    </div>
                    <div class="stat-box">
                        <h3>${reportData.maxSeverity}/10</h3>
                        <p>Peak Severity</p>
                    </div>
                    <div class="stat-box">
                        <h3>${topRegion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                        <p>Most Affected Area</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Symptom Timeline</h2>
                ${reportData.symptoms.map(symptom => `
                    <div class="symptom-item">
                        <h4>${new Date(symptom.datetime).toLocaleDateString()} - ${symptom.region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                        <p><strong>Type:</strong> ${symptom.type} | <strong>Severity:</strong> ${symptom.severity}/10</p>
                        <p><strong>Description:</strong> ${symptom.description}</p>
                        ${symptom.notes ? `<p><strong>Notes:</strong> ${symptom.notes}</p>` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Pattern Analysis</h2>
                <p><strong>Most Common Symptom Type:</strong> ${topType} (${reportData.typeStats[topType] || 0} occurrences)</p>
                <p><strong>Most Affected Body Region:</strong> ${topRegion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} (${reportData.regionStats[topRegion] || 0} occurrences)</p>
                <p><strong>Severity Range:</strong> ${reportData.minSeverity}/10 to ${reportData.maxSeverity}/10</p>
                <p><strong>Average Pain Level:</strong> ${reportData.avgSeverity}/10</p>
            </div>

            <div class="disclaimer">
                <h3>Important Medical Disclaimer</h3>
                <p><strong>This report is for informational and tracking purposes only.</strong> It does not constitute medical advice, diagnosis, or treatment recommendations. The patterns and correlations shown are observational and should be discussed with qualified healthcare professionals. Always consult your doctor for medical concerns and before making any healthcare decisions.</p>
                <p><em>Generated by MedPrep Tracker on ${new Date().toLocaleString()}</em></p>
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
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to corresponding button
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        this.currentTab = tabName;

        // Update content based on tab
        if (tabName === 'history') {
            this.renderHistory();
            this.generatePatternInsights();
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

// FIX 4: Real PDF Generation Function
function downloadReportPDF() {
    if (window.symptomTracker) {
        window.symptomTracker.generatePDFReport();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.symptomTracker = new SymptomTracker();
    console.log('MedPrep Tracker with Complete Functionality loaded successfully!');
});