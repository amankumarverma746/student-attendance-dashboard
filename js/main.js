/**
 * Main JavaScript File (Updated for API Integration)
 * Handles animations, interactions, and dynamic data rendering
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    initHeroAnimations();

    try {
        await initDynamicCounters();
    } catch (e) {
        console.error("Failed to load KPIs", e);
        showToast("Error loading KPI data", "error");
    }

    // Initialize charts when they enter the viewport
    initCharts();

    // Initialize global scroll animations
    initScrollAnimations();
});

/**
 * Section A: Hero Animations
 */
function initHeroAnimations() {
    const tl = gsap.timeline();

    tl.to('.hero-title', {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out'
    })
        .to('.hero-subtitle', {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power3.out'
        }, "-=0.8")
        .to('.kpi-card', {
            y: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.2,
            ease: 'expo.out'
        }, "-=0.6");
}

/**
 * Scroll Triggered Component Animations
 */
function initScrollAnimations() {
    gsap.from(".glass-card", {
        scrollTrigger: {
            trigger: "#problem-statement",
            start: "top 80%",
            once: true
        },
        opacity: 0,
        y: 80,
        duration: 1,
        stagger: 0.2,
        ease: 'expo.out'
    });

    // Pipeline steps
    gsap.from('.pipeline-step, .pipeline-arrow', {
        scrollTrigger: {
            trigger: '#pipeline',
            start: 'top 75%',
            once: true
        },
        x: -40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out'
    });

    // Chart cards (now also glass-cards)
    gsap.from('.chart-card', {
        scrollTrigger: {
            trigger: '#analytical-dashboard',
            start: 'top 70%',
            once: true
        },
        y: 80,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'expo.out'
    });
}

/**
 * Dynamic KPI Counters fetched from Backend
 */
async function initDynamicCounters() {
    const formatNumber = (num) => num.toString().replace(/(\\d)(?=(\\d{3})+(?!\\d))/g, '$1,');

    // Fetch real data from the backend API
    const kpiData = await API.getKPIs();

    // Map the DOM elements specifically to the API response keys
    const statMaps = [
        { selector: '.kpi-grid .kpi-card:nth-child(1) .kpi-value', data: kpiData.total_students, isPercent: false },
        { selector: '.kpi-grid .kpi-card:nth-child(2) .kpi-value', data: kpiData.avg_attendance, isPercent: true },
        { selector: '.kpi-grid .kpi-card:nth-child(3) .kpi-value', data: kpiData.risk_count, isPercent: false },
        { selector: '.kpi-grid .kpi-card:nth-child(4) .kpi-value', data: kpiData.highest_attendance, isPercent: true },
        { selector: '.kpi-grid .kpi-card:nth-child(5) .kpi-value', data: kpiData.total_records, isPercent: false }
    ];

    statMaps.forEach(item => {
        const counter = document.querySelector(item.selector);
        if (!counter) return;

        const target = parseFloat(item.data) || 0;
        const isPercent = item.isPercent;

        ScrollTrigger.create({
            trigger: counter,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 3,
                    ease: 'expo.out',
                    onUpdate: () => {
                        if (isPercent) {
                            counter.innerHTML = obj.val.toFixed(1) + '%';
                        } else {
                            counter.innerHTML = formatNumber(Math.floor(obj.val));
                        }
                    }
                });
            }
        });
    });

    // Business Impact Counters
    const impactCounters = document.querySelectorAll('.stat-number');

    impactCounters.forEach(counter => {
        const htmlContent = counter.innerHTML;
        const numberMatch = htmlContent.match(/^(\\d+)/);
        const suffixMatch = htmlContent.match(/(<small>.*<\/small>)$/);

        if (numberMatch) {
            const target = parseInt(numberMatch[1]);
            const suffix = suffixMatch ? suffixMatch[1] : '';

            counter.innerHTML = `0${suffix}`;

            ScrollTrigger.create({
                trigger: counter,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 3.5,
                        ease: 'expo.out',
                        onUpdate: () => counter.innerHTML = `${Math.floor(obj.val)}${suffix}`
                    });
                }
            });
        }
    });
}

/**
 * Section F: Chart.js Visualizations (Dynamic Loading)
 */
function initCharts() {
    // Default Chart.js Configuration
    // Default Chart.js Configuration
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.color = "#9CA3AF";
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(11, 15, 26, 0.9)';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(124,58,237,0.3)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;

    let chartsRendered = false;

    ScrollTrigger.create({
        trigger: '#analytical-dashboard',
        start: 'top 70%',
        once: true,
        onEnter: async () => {
            if (!chartsRendered) {
                chartsRendered = true;

                try {
                    // Fetch all data concurrently
                    const [trendData, ratioData, classData] = await Promise.all([
                        API.getMonthlyTrend(),
                        API.getStatusRatio(),
                        API.getClassDistribution()
                    ]);

                    renderTrendChart(trendData);
                    renderRatioChart(ratioData);
                    renderSubjectChart(classData);
                } catch (e) {
                    console.error("Failed to load chart data:", e);
                    showToast("Error loading chart data", "error");
                }
            }
        }
    });
}

function renderTrendChart(apiData) {
    const ctx = document.getElementById('trendChart').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(139, 92, 246, 0.5)"); // #8B5CF6 with opacity for line chart fill
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)"); // #3B82F6 fading out

    const labels = apiData.map(d => `${d.month}/${d.year}`);
    const values = apiData.map(d => d.avg_attendance_pct);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Average Attendance %',
                data: values,
                borderColor: "#A78BFA",
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0B0F1A',
                pointBorderColor: '#A78BFA',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: c => c.dataset.label + ': ' + c.parsed.y + '%' } }
            },
            scales: {
                y: { min: 60, max: 100, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false } },
                x: { grid: { display: false } }
            },
            animation: { duration: 2000, easing: 'easeOutQuart' }
        }
    });
}

function renderRatioChart(apiData) {
    const ctx = document.getElementById('ratioChart').getContext('2d');

    const labels = apiData.map(d => d.status === 'P' ? 'Present' : d.status === 'A' ? 'Absent' : 'Excused');
    const values = apiData.map(d => d.percentage);
    const colors = apiData.map(d => d.status === 'P' ? '#3fb950' : d.status === 'A' ? '#f85149' : '#A78BFA');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                tooltip: { callbacks: { label: c => ' ' + c.label + ': ' + c.parsed + '%' } }
            },
            animation: { animateScale: true, animateRotate: true, duration: 1500 }
        }
    });
}

function renderSubjectChart(apiData) {
    const ctx = document.getElementById('subjectChart').getContext('2d');

    const labels = apiData.map(d => d.class_name);
    const values = apiData.map(d => d.attendance_pct);

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#8B5CF6");
    gradient.addColorStop(1, "#3B82F6");

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Attendance %',
                data: values,
                backgroundColor: gradient,
                borderColor: "#A78BFA",
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: false, min: 50, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            },
            animation: { duration: 1500, delay: 200 }
        }
    });
}
