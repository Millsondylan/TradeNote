import { createRouter, createWebHistory } from 'vue-router'
import LoginRegisterLayout from '../layouts/LoginRegister.vue'
import DashboardLayout from '../layouts/Dashboard.vue'
import { registerOff } from '../stores/globals'
import axios from 'axios'

(async () => {
    async function getRegisterPage() {
        return new Promise((resolve, reject) => {
            console.log("\nGETTING REGISTER PAGE")
            axios.post('/api/registerPage')
                .then((response) => {
                    //console.log(" response "+JSON.stringify(response))
                    //localStorage.setItem('parse_app_id', response.data)
                    //console.log("  --> App id in localstorage " + localStorage.getItem('parse_app_id'))
                    registerOff.value = response.data
                    resolve()
                })
                .catch((error) => {
                    console.log(" -> Error getting register page " + error)
                    reject(error)
                });


        })
    }

    await getRegisterPage()
})();


const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
        path: '/',
        name: 'login',
        meta: {
            title: "Login",
            layout: LoginRegisterLayout
        },
        component: () =>
            import('../views/Login.vue')
    },
    {
        path: '/register',
        name: 'register',
        meta: {
            title: "Register",
            layout: LoginRegisterLayout
        },
        component: () =>
            import('../views/Register.vue')
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        meta: {
            title: "Dashboard",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Dashboard.vue')
    },
    {
        path: '/calendar',
        name: 'calendar',
        meta: {
            title: "Calendar",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Calendar.vue')
    },
    {
        path: '/daily',
        name: 'daily',
        meta: {
            title: "Daily",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Daily.vue')
    },
    {
        path: '/diary',
        name: 'diary',
        meta: {
            title: "Diary",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Diary.vue')
    },
    {
        path: '/screenshots',
        name: 'screenshots',
        meta: {
            title: "Screenshots",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Screenshots.vue')
    },
    {
        path: '/playbook',
        name: 'playbook',
        meta: {
            title: "Playbook",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Playbook.vue')
    },
    {
        path: '/addTrades',
        name: 'addTrades',
        meta: {
            title: "Add Trades",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/AddTrades.vue')
        
    },
    {
        path: '/addDiary',
        name: 'addDiary',
        meta: {
            title: "Add Diary",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/AddDiary.vue')
    },
    {
        path: '/addPlaybook',
        name: 'addPlaybook',
        meta: {
            title: "Add Playbook",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/AddPlaybook.vue')
    },
    {
        path: '/addScreenshot',
        name: 'addScreenshot',
        meta: {
            title: "Add Screenshot",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/AddScreenshot.vue')
    },
    {
        path: '/addExcursions',
        name: 'addExcursions',
        meta: {
            title: "Add Excursions",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/AddExcursions.vue')
    },
    {
        path: '/settings',
        name: 'settings',
        meta: {
            title: "Settings",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Settings.vue')
    },
    {
        path: '/imports',
        name: 'imports',
        meta: {
            title: "Imports",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Imports.vue')
    },
    {
        path: '/checkout',
        name: 'checkout',
        meta: {
            title: "Checkout",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Checkout.vue')
    },
    {
        path: '/checkoutSuccess',
        name: 'checkoutSuccess',
        meta: {
            title: "Checkout Success",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/CheckoutSuccess.vue')
    },
    // New Trading Features
    {
        path: '/live-trades',
        name: 'live-trades',
        meta: {
            title: "Live Trades",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/LiveTrades.vue')
    },
    {
        path: '/history',
        name: 'history',
        meta: {
            title: "Trading History",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/History.vue')
    },
    {
        path: '/watchlist',
        name: 'watchlist',
        meta: {
            title: "Watchlist",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Watchlist.vue')
    },
    {
        path: '/alarms',
        name: 'alarms',
        meta: {
            title: "Price Alarms",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/Alarms.vue')
    },
    // AI & Analytics Features
    {
        path: '/ai-coach',
        name: 'ai-coach',
        meta: {
            title: "AI Coach",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/AICoach.vue')
    },
    {
        path: '/ai-strategy',
        name: 'ai-strategy',
        meta: {
            title: "AI Strategy Builder",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/AICoach.vue')
    },
    {
        path: '/performance-calendar',
        name: 'performance-calendar',
        meta: {
            title: "Performance Calendar",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/PerformanceCalendar.vue')
    },
    {
        path: '/news',
        name: 'news',
        meta: {
            title: "Market News",
            layout: DashboardLayout
        },
        component: () =>
            import('../views/News.vue')
    }
    ]
})

router.beforeEach((to, from, next) => {
    // Get the page title from the route meta data that we have defined
    // See further down below for how we setup this data
    const title = to.meta.title
    // If the route has a title, set it as the page title of the document/page
    if (title) {
        document.title = title
    }
    // Continue resolving the route
    if (to.name === 'register' && registerOff.value) {
        next('/')
    } else {
        next()
    }
})

export default router