// Symptom Tracker Application
class SymptomTracker {
    constructor() {
        this.symptoms = JSON.parse(localStorage.getItem('symptoms') || '[]');
        this.appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        this.selectedRegion = null;
        this.currentTab = 'tracker';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.updateSeverityDisplay();
        this.renderHistory();
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

    saveSymptom() {
        const type = document.getElementById('symptom-type')?.value;
        const description = document.getElementById('symptom-description')?.value;
        const severity = document.getElementById('severity')?.value;
        const time = document.getElementById('symptom-time')?.value;
        const notes = document.getElementById('symptom-notes')?.value;

        if (!this.selectedRegion || !type || !description) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const symptom = {
            id: Date.now().toString(),
            region: this.selectedRegion,
            type: type,
            description: description,
            severity: parseInt(severity),
            datetime: time,
            notes: notes,
            created: new Date().toISOString()
        };

        this.symptoms.push(symptom);
        this.saveToStorage();
        this.showToast('Symptom logged successfully!');
        this.clearForm();
        this.updateStats();
        this.renderHistory();
    }

    clearForm() {
        // Clear form inputs
        const inputs = ['symptom-type', 'symptom-description', 'symptom-notes'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
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
                            ${symptom.region.replace('-', ' ')} - ${symptom.type}
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

    saveToStorage() {
        localStorage.setItem('symptoms', JSON.stringify(this.symptoms));
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
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

    saveAppointment() {
        const doctorName = document.getElementById('doctor-name')?.value;
        const appointmentDate = document.getElementById('appointment-date')?.value;
        const visitReason = document.getElementById('visit-reason')?.value;

        if (!doctorName || !appointmentDate) {
            this.showToast('Please fill in doctor name and appointment date', 'error');
            return;
        }

        const appointment = {
            id: Date.now().toString(),
            doctor: doctorName,
            datetime: appointmentDate,
            reason: visitReason,
            created: new Date().toISOString()
        };

        this.appointments.push(appointment);
        this.saveToStorage();
        this.showToast('Appointment saved successfully!');
        this.generateVisitSummary();
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
                        <li>Most affected area: <strong>${mostCommonRegion.replace('-', ' ')}</strong> (${regionCounts[mostCommonRegion]} occurrences)</li>
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
                            ${symptom.region.replace('-', ' ')} - ${symptom.type}
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

        this.showLoadingOverlay(true);

        // Simulate report generation
        setTimeout(() => {
            const reportData = this.getReportData(timeframe);
            this.showReportPreview(reportData);
            this.showLoadingOverlay(false);
            this.showToast('Report generated successfully!');
        }, 2000);
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

        return {
            timeframe: timeframe,
            symptoms: relevantSymptoms,
            totalCount: relevantSymptoms.length,
            avgSeverity: relevantSymptoms.length > 0 ? 
                (relevantSymptoms.reduce((sum, s) => sum + s.severity, 0) / relevantSymptoms.length).toFixed(1) : 0
        };
    }

    showReportPreview(data) {
        const preview = document.getElementById('report-preview');
        if (!preview) return;

        preview.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="color: #c4b5fd; margin-bottom: 15px;">Report Summary</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #4facfe;">${data.totalCount}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Total Symptoms</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #f093fb;">${data.avgSeverity}</div>
                        <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Avg Severity</div>
                    </div>
                </div>
            </div>
            <button class="btn-primary" onclick="downloadReportPDF()" style="width: 100%;">
                <span class="btn-icon">📥</span>
                Download PDF Report
            </button>
        `;
    }

    showLoadingOverlay(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    quickLogSymptom() {
        // Switch to tracker tab and show instruction
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

function downloadReportPDF() {
    // Placeholder for PDF generation
    alert('PDF download feature coming soon! For now, you can screenshot or print this page.');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.symptomTracker = new SymptomTracker();
    console.log('MedPrep Tracker loaded successfully!');
});