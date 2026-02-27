const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

/**
 * Core API Wrapper with Loading State & Error Handling
 */
const API_CORE = {
    async request(endpoint, options = {}) {
        // Toggle global loading state if desired (could trigger a spinner UI)
        document.body.classList.add('loading-active');

        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const config = {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                }
            };

            if (config.body && typeof config.body !== 'string') {
                config.body = JSON.stringify(config.body);
            }

            const response = await fetch(url, config);
            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.error || 'API Request Failed');
            }

            return json;
        } catch (error) {
            console.error(`[API Error] ${endpoint}:`, error);
            showToast(error.message, 'error');
            throw error; // Re-throw so caller can handle specific failures
        } finally {
            document.body.classList.remove('loading-active');
        }
    },

    get(endpoint) { return this.request(endpoint, { method: 'GET' }); },
    post(endpoint, body) { return this.request(endpoint, { method: 'POST', body }); },
    put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body }); },
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};

/**
 * Domain-Specific Endpoint Wrappers
 */
const API = {
    // Analytics
    getKPIs: async () => (await API_CORE.get('/analytics/kpi')).data,
    getMonthlyTrend: async () => (await API_CORE.get('/analytics/monthly')).data,
    getStatusRatio: async () => (await API_CORE.get('/analytics/ratio')).data,
    getClassDistribution: async () => (await API_CORE.get('/analytics/classes')).data,

    // Students Example
    getStudents: async (class_id, year_id, limit = 50) =>
        (await API_CORE.get(`/students/class/${class_id}/year/${year_id}?limit=${limit}`)).data,
    addStudent: async (data) => await API_CORE.post('/students', data),

    // Abstract generic call for UI buttons
    deleteStudent: async (id) => {
        const res = await API_CORE.delete(`/students/${id}`);
        showToast('Student deleted successfully', 'success');
        return res;
    }
};

// Global Toast utility for UI notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(toast, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
        setTimeout(() => {
            gsap.to(toast, { y: 20, opacity: 0, duration: 0.3, onComplete: () => toast.remove() });
        }, 3500);
    } else {
        setTimeout(() => toast.remove(), 3500);
    }
}
