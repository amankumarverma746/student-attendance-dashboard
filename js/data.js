/**
 * Mock Data for Chart.js Visualizations
 */

const chartData = {
    trend: {
        labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        datasets: [
            {
                label: 'Average Attendance %',
                data: [92, 88, 85, 81, 78, 82],
                borderColor: '#0A1F44',
                backgroundColor: 'rgba(10, 31, 68, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#0A1F44',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    },
    ratio: {
        labels: ['Present', 'Absent', 'Leave/Excused'],
        datasets: [
            {
                data: [82.4, 15.1, 2.5],
                backgroundColor: ['#2e7d32', '#d32f2f', '#f57c00'],
                borderWidth: 0,
                hoverOffset: 4
            }
        ]
    },
    subjects: {
        labels: ['Data Structures', 'Database Systems', 'Software Eng', 'Mathematics', 'Operating Sys'],
        datasets: [
            {
                label: 'Attendance %',
                data: [86, 91, 79, 74, 82],
                backgroundColor: '#1e3a6e',
                borderRadius: 4
            }
        ]
    }
};
