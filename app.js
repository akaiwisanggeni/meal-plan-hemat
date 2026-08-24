// ==========================================
// MEAL PLAN HEMAT
// Supabase + Magic Link + Dashboard
// Ebook + Daily Calorie + Calorie Needs
// + BB Tracker
// + Habit Tracker
// ==========================================




const SUPABASE_URL =
    "https://ykzlxqkqrcyzwrcwdibr.supabase.co";




const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_hEr2rTC20D2ihYZBvKcSow_PvpcGLeK";




const REDIRECT_URL =
    "https://meal-plan-hemat.vercel.app/";




const STORAGE_BUCKET =
    "Ebooks";


const ASSET_BUCKET =
    "Assets";


const ICON_BASE_URL =
    SUPABASE_URL +
    "/storage/v1/object/public/" +
    ASSET_BUCKET +
    "/icons";


function applyMPHIcons() {

    document
        .querySelectorAll("[data-mph-icon]")
        .forEach(function (element) {

            const iconName =
                element.getAttribute("data-mph-icon");

            if (!iconName) {
                return;
            }

            element.src =
                ICON_BASE_URL +
                "/" +
                encodeURIComponent(iconName);

            element.alt = "";
            element.setAttribute("aria-hidden", "true");

        });

}





const EBOOK_FILES = {


    main:
        "30 Menu Ayam dan Telur_.pdf",


    weekly:
        "Weekly Shopping List_.pdf",


    portion:
        "Food Portion Guide_.pdf",


    calorie:
        "Calorie Cheat Sheet_.pdf",


    mixmatch:
        "Meal Plan Mix & Match_.pdf",


    snack:
        "Healthy Snack Guide_.pdf",


    planner:
        "30 Days Meal Planner_.pdf"


};






// ==========================================
// LOAD SUPABASE
// ==========================================




const supabaseScript =
    document.createElement(
        "script"
    );




supabaseScript.src =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";




supabaseScript.onload =
    async function () {




    applyMPHIcons();


    // ==========================================
    // CREATE SUPABASE CLIENT
    // ==========================================




    window.mphSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );




    console.log(
        "MPH: Supabase client berhasil dibuat."
    );






    // ==========================================
    // ELEMENTS
    // ==========================================




    const loginScreen =
        document.getElementById(
            "loginScreen"
        );




    const dashboardScreen =
        document.getElementById(
            "dashboardScreen"
        );




    const calorieScreen =
        document.getElementById(
            "calorieScreen"
        );




    const weightScreen =
        document.getElementById(
            "weightScreen"
        );




    const habitScreen =
        document.getElementById(
            "habitScreen"
        );


    const pdfViewerScreen =
        document.getElementById(
            "pdfViewerScreen"
        );


    const pdfViewerBackButton =
        document.getElementById(
            "pdfViewerBackButton"
        );


    const pdfViewerTitle =
        document.getElementById(
            "pdfViewerTitle"
        );


    const pdfViewerContent =
        document.getElementById(
            "pdfViewerContent"
        );


    const pdfViewerStatus =
        document.getElementById(
            "pdfViewerStatus"
        );




    const loginButton =
        document.getElementById(
            "loginButton"
        );




    const logoutButton =
        document.getElementById(
            "logoutButton"
        );




    const emailInput =
        document.getElementById(
            "email"
        );




    const message =
        document.getElementById(
            "message"
        );


    const greetingName =
        document.getElementById(
            "greetingName"
        );


    const nameSetupModal =
        document.getElementById(
            "nameSetupModal"
        );


    const nameSetupInput =
        document.getElementById(
            "nameSetupInput"
        );


    const nameSetupSave =
        document.getElementById(
            "nameSetupSave"
        );


    const nameSetupError =
        document.getElementById(
            "nameSetupError"
        );






    // ==========================================
    // SCREEN FUNCTIONS
    // ==========================================

    // ==========================================
    // SCREEN PERSISTENCE
    // ==========================================

    const LAST_SCREEN_KEY = "mph_last_screen";

    function saveLastScreen(screen) {
        localStorage.setItem(LAST_SCREEN_KEY, screen);
    }

    function getLastScreen() {
        return localStorage.getItem(LAST_SCREEN_KEY) || "home";
    }

    function clearLastScreen() {
        localStorage.removeItem(LAST_SCREEN_KEY);
    }

    async function restoreLastScreen(session) {
        const lastScreen = getLastScreen();

        if (lastScreen === "calorie") {
            await showCalorieScreen();
        } else if (lastScreen === "weight") {
            await showWeightScreen();
        } else if (lastScreen === "habit") {
            await showHabitScreen();
        } else {
            await showDashboard(session);
        }
    }






    function showLogin() {




        loginScreen.style.display =
            "flex";




        dashboardScreen.style.display =
            "none";




        calorieScreen.style.display =
            "none";




        weightScreen.style.display =
            "none";




        if (habitScreen) {


            habitScreen.style.display =
                "none";


        }


        if (pdfViewerScreen) {


            pdfViewerScreen.style.display =
                "none";


        }




    }






    function setGreetingName(name) {

        if (!greetingName) {
            return;
        }

        greetingName.textContent =
            name || "Kamu";

    }


    function getSavedUserName(user) {

        if (!user || !user.user_metadata) {
            return "";
        }

        return String(
            user.user_metadata.full_name ||
            user.user_metadata.name ||
            ""
        ).trim();

    }


    async function ensureUserName(session) {

        const user =
            session && session.user
                ? session.user
                : await getCurrentUser();

        if (!user) {
            return null;
        }

        const existingName =
            getSavedUserName(user);

        if (existingName) {
            setGreetingName(existingName);
            return user;
        }

        if (!nameSetupModal || !nameSetupInput || !nameSetupSave) {
            setGreetingName("Kamu");
            return user;
        }

        nameSetupModal.classList.add("show");
        nameSetupModal.setAttribute("aria-hidden", "false");
        nameSetupInput.value = "";
        nameSetupError.textContent = "";

        setTimeout(function () {
            nameSetupInput.focus();
        }, 50);

        return new Promise(function (resolve) {

            async function saveName() {

                const name =
                    nameSetupInput.value.trim();

                if (!name) {
                    nameSetupError.textContent =
                        "Masukkan nama kamu dulu.";
                    nameSetupInput.focus();
                    return;
                }

                nameSetupSave.disabled = true;
                nameSetupSave.textContent = "Menyimpan...";
                nameSetupError.textContent = "";

                const {
                    data,
                    error
                } = await window.mphSupabase.auth.updateUser({
                    data: {
                        full_name: name
                    }
                });

                if (error) {
                    console.error(
                        "MPH: Gagal menyimpan nama user.",
                        error
                    );
                    nameSetupError.textContent =
                        "Nama belum tersimpan. Coba lagi.";
                    nameSetupSave.disabled = false;
                    nameSetupSave.textContent = "Lanjut";
                    return;
                }

                const updatedUser =
                    data && data.user
                        ? data.user
                        : user;

                setGreetingName(name);
                nameSetupModal.classList.remove("show");
                nameSetupModal.setAttribute("aria-hidden", "true");
                nameSetupSave.disabled = false;
                nameSetupSave.textContent = "Lanjut";
                nameSetupSave.removeEventListener("click", saveName);
                nameSetupInput.removeEventListener("keydown", handleKeydown);

                resolve(updatedUser);

            }

            function handleKeydown(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    saveName();
                }
            }

            nameSetupSave.addEventListener("click", saveName);
            nameSetupInput.addEventListener("keydown", handleKeydown);

        });

    }


    async function showDashboard(
        session
    ) {

        const namedUser =
            await ensureUserName(session);

        if (namedUser && session) {
            session.user = namedUser;
        }

        saveLastScreen("home");

        loginScreen.style.display =
            "none";




        dashboardScreen.style.display =
            "block";




        calorieScreen.style.display =
            "none";




        weightScreen.style.display =
            "none";




        if (habitScreen) {


            habitScreen.style.display =
                "none";


        }


        if (pdfViewerScreen) {


            pdfViewerScreen.style.display =
                "none";


        }




        window.scrollTo(
            0,
            0
        );




        await loadHomeWeight();




        await loadHomeHabit();


    }






    async function showCalorieScreen() {

        saveLastScreen("calorie");

        loginScreen.style.display =
            "none";




        dashboardScreen.style.display =
            "none";




        calorieScreen.style.display =
            "block";




        weightScreen.style.display =
            "none";




        if (habitScreen) {


            habitScreen.style.display =
                "none";


        }


        if (pdfViewerScreen) {


            pdfViewerScreen.style.display =
                "none";


        }




        window.scrollTo(
            0,
            0
        );




        await loadDailyFoodLogs();


    }






    async function showWeightScreen() {

        saveLastScreen("weight");

        loginScreen.style.display =
            "none";




        dashboardScreen.style.display =
            "none";




        calorieScreen.style.display =
            "none";




        weightScreen.style.display =
            "block";




        if (habitScreen) {


            habitScreen.style.display =
                "none";


        }


        if (pdfViewerScreen) {


            pdfViewerScreen.style.display =
                "none";


        }




        window.scrollTo(
            0,
            0
        );




        await loadWeightLogs();


    }






    async function showHabitScreen() {

        saveLastScreen("habit");

        loginScreen.style.display =
            "none";




        dashboardScreen.style.display =
            "none";




        calorieScreen.style.display =
            "none";




        weightScreen.style.display =
            "none";




        if (habitScreen) {


            habitScreen.style.display =
                "block";


        }


        if (pdfViewerScreen) {


            pdfViewerScreen.style.display =
                "none";


        }




        window.scrollTo(
            0,
            0
        );




        await initializeHabits();




        await loadHabitDataForDate(
            getTodayDate()
        );




        renderHabitWeek();


    }






    // ==========================================
    // EBOOK
    // ==========================================




    const EBOOK_TITLES = {

        "30 Menu Ayam dan Telur_.pdf":
            "30 Menu Ayam dan Telur",

        "Weekly Shopping List_.pdf":
            "Weekly Shopping List",

        "Food Portion Guide_.pdf":
            "Food Portion Guide",

        "Calorie Cheat Sheet_.pdf":
            "Calorie Cheat Sheet",

        "Meal Plan Mix & Match_.pdf":
            "Meal Plan Mix & Match",

        "Healthy Snack Guide_.pdf":
            "Healthy Snack Guide",

        "30 Days Meal Planner_.pdf":
            "30 Days Meal Planner"

    };


    let activePdfUrl = null;


    function hideAllScreensForPdf() {

        loginScreen.style.display =
            "none";

        dashboardScreen.style.display =
            "none";

        calorieScreen.style.display =
            "none";

        weightScreen.style.display =
            "none";

        if (habitScreen) {

            habitScreen.style.display =
                "none";

        }

        if (pdfViewerScreen) {

            pdfViewerScreen.style.display =
                "block";

        }

        window.scrollTo(
            0,
            0
        );

    }


    function clearPdfViewer() {

        if (!pdfViewerContent) {
            return;
        }

        pdfViewerContent.innerHTML =
            '<div id="pdfViewerStatus" class="pdf-viewer-status">Memuat ebook...</div>';

    }


    async function renderPdfDocument(
        pdfUrl
    ) {

        if (
            !window.pdfjsLib ||
            !window.pdfjsLib.getDocument
        ) {

            throw new Error(
                "PDF.js tidak tersedia."
            );

        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const loadingTask =
            window.pdfjsLib.getDocument({
                url: pdfUrl,
                withCredentials: false
            });

        const pdf =
            await loadingTask.promise;

        const fragment =
            document.createDocumentFragment();

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber += 1
        ) {

            const page =
                await pdf.getPage(pageNumber);

            const baseViewport =
                page.getViewport({
                    scale: 1
                });

            const availableWidth =
                Math.min(
                    880,
                    Math.max(
                        280,
                        pdfViewerContent.clientWidth - 10
                    )
                );

            const scale =
                availableWidth /
                baseViewport.width;

            const viewport =
                page.getViewport({
                    scale: scale
                });

            const outputScale =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            const pageWrap =
                document.createElement(
                    "div"
                );

            pageWrap.className =
                "pdf-page-wrap";

            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                Math.floor(
                    viewport.width *
                    outputScale
                );

            canvas.height =
                Math.floor(
                    viewport.height *
                    outputScale
                );

            canvas.style.width =
                viewport.width +
                "px";

            canvas.style.height =
                viewport.height +
                "px";

            pageWrap.appendChild(
                canvas
            );

            fragment.appendChild(
                pageWrap
            );

            const context =
                canvas.getContext(
                    "2d"
                );

            await page.render({
                canvasContext:
                    context,
                viewport:
                    viewport,
                transform:
                    outputScale !== 1
                        ? [
                            outputScale,
                            0,
                            0,
                            outputScale,
                            0,
                            0
                        ]
                        : null
            }).promise;

        }

        pdfViewerContent.innerHTML = "";
        pdfViewerContent.appendChild(
            fragment
        );

    }


    async function openEbook(
        fileName
    ) {

        if (!fileName) {
            return;
        }

        hideAllScreensForPdf();
        clearPdfViewer();

        if (pdfViewerTitle) {

            pdfViewerTitle.textContent =
                EBOOK_TITLES[fileName] ||
                "Ebook";

        }

        try {

            const {
                data,
                error
            } =
                await window.mphSupabase
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .createSignedUrl(
                        fileName,
                        3600
                    );

            if (
                error ||
                !data ||
                !data.signedUrl
            ) {

                throw (
                    error ||
                    new Error(
                        "Signed URL tidak tersedia."
                    )
                );

            }

            activePdfUrl =
                data.signedUrl;

            await renderPdfDocument(
                activePdfUrl
            );

        }
        catch (error) {

            console.error(
                "MPH: Gagal membuka ebook.",
                error
            );

            if (pdfViewerContent) {

                pdfViewerContent.innerHTML =
                    '<div class="pdf-viewer-status">Ebook tidak dapat dibuka. Silakan coba lagi.</div>';

            }

        }

    }




    // ==========================================
    // MAIN EBOOK CARD
    // ==========================================


    const mainEbookCard =
        document.getElementById(
            "mainEbookCard"
        );


    if (mainEbookCard) {


        mainEbookCard.addEventListener(
            "click",
            function () {


                openEbook(
                    EBOOK_FILES.main
                );


            }
        );


        mainEbookCard.addEventListener(
            "keydown",
            function (event) {


                if (
                    event.key ===
                        "Enter" ||
                    event.key ===
                        " "
                ) {


                    event.preventDefault();


                    openEbook(
                        EBOOK_FILES.main
                    );


                }


            }
        );


    }




    // ==========================================
    // LIBRARY EBOOK CARDS
    // ==========================================


    document
        .querySelectorAll(".library-item[data-file]")
        .forEach(function (item) {

            item.addEventListener(
                "click",
                function () {

                    openEbook(
                        item.getAttribute("data-file")
                    );

                }
            );

        });



    if (pdfViewerBackButton) {

        pdfViewerBackButton.addEventListener(
            "click",
            async function () {

                activePdfUrl = null;

                let session =
                    mphPendingSession;

                if (!session) {

                    session =
                        (
                            await window.mphSupabase
                                .auth
                                .getSession()
                        ).data.session;

                }

                if (session) {

                    await showDashboard(
                        session
                    );

                } else {

                    showLogin();

                }

            }
        );

    }


    // ==========================================
    // APP INITIALIZATION GATE
    // ==========================================
    // Queue auth sessions until every app variable is initialized.
    let mphAppReady = false;
    let mphPendingSession = null;


    // ==========================================
    // CHECK CURRENT SESSION
    // ==========================================




    const {
        data: {
            session
        },


        error:
            sessionError
    } =
        await window.mphSupabase
            .auth
            .getSession();




    if (sessionError) {




        console.error(
            "MPH: Gagal mengecek session.",
            sessionError
        );




        showLogin();


    }


    else if (session) {




        console.log(
            "MPH: User sudah login.",
            session.user.email
        );




        mphPendingSession =
            session;


    }


    else {




        console.log(
            "MPH: Belum ada session."
        );




        showLogin();


    }






    // ==========================================
    // AUTH STATE CHANGE
    // ==========================================




    window.mphSupabase
        .auth
        .onAuthStateChange(
            async function (
                event,
                session
            ) {




                console.log(
                    "MPH Auth Event:",
                    event
                );




                if (session) {




                    mphPendingSession =
                        session;


                    if (mphAppReady) {




                        await restoreLastScreen(
                            session
                        );


                    }


                }


                else {



                    localStorage.removeItem(
                        "mph_login_streak"
                    );




                    mphPendingSession =
                        null;


                    clearLastScreen();
                    showLogin();


                }


            }
        );






    // ==========================================
    // MAGIC LINK LOGIN
    // ==========================================




    loginButton.addEventListener(
        "click",
        async function () {




            const email =
                emailInput.value.trim();




            if (!email) {




                message.style.display =
                    "block";




                message.textContent =
                    "Masukkan email kamu terlebih dahulu.";




                return;


            }




            if (!email.includes("@")) {




                message.style.display =
                    "block";




                message.textContent =
                    "Masukkan alamat email yang valid.";




                return;


            }




            loginButton.disabled =
                true;




            loginButton.textContent =
                "Mengirim...";




            message.style.display =
                "none";




            const {
                error
            } =
                await window.mphSupabase
                    .auth
                    .signInWithOtp({


                        email:
                            email,


                        options: {


                            emailRedirectTo:
                                REDIRECT_URL


                        }


                    });




            if (error) {




                console.error(
                    "MPH: Gagal mengirim Magic Link.",
                    error
                );




                message.style.display =
                    "block";




                message.textContent =
                    "Gagal mengirim link login. Silakan coba lagi.";




                loginButton.disabled =
                    false;




                loginButton.textContent =
                    "Kirim Magic Link";




                return;


            }




            message.style.display =
                "block";




            message.textContent =
                "Magic Link sudah dikirim ke email kamu. Cek inbox dan klik link tersebut untuk masuk.";




            loginButton.disabled =
                false;




            loginButton.textContent =
                "Kirim Ulang Magic Link";




            console.log(
                "MPH: Magic Link berhasil dikirim ke:",
                email
            );


        }
    );






    // ==========================================
    // LOGOUT
    // ==========================================




    logoutButton.addEventListener(
        "click",
        async function () {




            logoutButton.disabled =
                true;




            logoutButton.textContent =
                "Logging out...";




            const {
                error
            } =
                await window.mphSupabase
                    .auth
                    .signOut();




            if (error) {




                console.error(
                    "MPH: Logout gagal.",
                    error
                );




                logoutButton.disabled =
                    false;




                logoutButton.textContent =
                    "Logout";




                return;


            }




            console.log(
                "MPH: User berhasil logout."
            );




            logoutButton.disabled =
                false;




            logoutButton.textContent =
                "Logout";


        }
    );






    // ==========================================
    // NAVIGATION
    // ==========================================




    const navHome =
        document.getElementById(
            "navHome"
        );




    const navCalorie =
        document.getElementById(
            "navCalorie"
        );




    const navWeight =
        document.getElementById(
            "navWeight"
        );




    const navHabit =
        document.getElementById(
            "navHabit"
        );




    const openCalorieButton =
        document.getElementById(
            "openCalorieButton"
        );




    const openWeightButton =
        document.getElementById(
            "openWeightButton"
        );




    const openHabitButton =
        document.getElementById(
            "openHabitButton"
        );




    const backFromCalorie =
        document.getElementById(
            "backFromCalorie"
        );




    const backFromWeight =
        document.getElementById(
            "backFromWeight"
        );




    const backFromHabit =
        document.getElementById(
            "backFromHabit"
        );




    if (navHome) {




        navHome.addEventListener(
            "click",
            showDashboard
        );


    }




    if (navCalorie) {




        navCalorie.addEventListener(
            "click",
            showCalorieScreen
        );


    }




    if (navWeight) {




        navWeight.addEventListener(
            "click",
            showWeightScreen
        );


    }




    if (navHabit) {




        navHabit.addEventListener(
            "click",
            showHabitScreen
        );


    }




    if (openHabitButton) {




        openHabitButton.addEventListener(
            "click",
            showHabitScreen
        );


    }




    if (openCalorieButton) {




        openCalorieButton.addEventListener(
            "click",
            showCalorieScreen
        );


    }




    if (openWeightButton) {




        openWeightButton.addEventListener(
            "click",
            showWeightScreen
        );


    }




    if (backFromCalorie) {




        backFromCalorie.addEventListener(
            "click",
            showDashboard
        );


    }




    if (backFromWeight) {




        backFromWeight.addEventListener(
            "click",
            showDashboard
        );


    }




    if (backFromHabit) {




        backFromHabit.addEventListener(
            "click",
            showDashboard
        );


    }






    // ==========================================
    // CALORIE NAVIGATION
    // ==========================================




    const calNavHome =
        document.getElementById(
            "calNavHome"
        );




    const calNavCalorie =
        document.getElementById(
            "calNavCalorie"
        );




    const calNavWeight =
        document.getElementById(
            "calNavWeight"
        );




    const calNavHabit =
        document.getElementById(
            "calNavHabit"
        );




    if (calNavHome) {




        calNavHome.addEventListener(
            "click",
            showDashboard
        );


    }




    if (calNavCalorie) {




        calNavCalorie.addEventListener(
            "click",
            showCalorieScreen
        );


    }




    if (calNavWeight) {




        calNavWeight.addEventListener(
            "click",
            showWeightScreen
        );


    }




    if (calNavHabit) {




        calNavHabit.addEventListener(
            "click",
            showHabitScreen
        );


    }






    // ==========================================
    // WEIGHT NAVIGATION
    // ==========================================




    const weightNavHome =
        document.getElementById(
            "weightNavHome"
        );




    const weightNavCalorie =
        document.getElementById(
            "weightNavCalorie"
        );




    const weightNavWeight =
        document.getElementById(
            "weightNavWeight"
        );




    const weightNavHabit =
        document.getElementById(
            "weightNavHabit"
        );




    if (weightNavHome) {




        weightNavHome.addEventListener(
            "click",
            showDashboard
        );


    }




    if (weightNavCalorie) {




        weightNavCalorie.addEventListener(
            "click",
            showCalorieScreen
        );


    }




    if (weightNavWeight) {




        weightNavWeight.addEventListener(
            "click",
            showWeightScreen
        );


    }




    if (weightNavHabit) {




        weightNavHabit.addEventListener(
            "click",
            showHabitScreen
        );


    }






    // ==========================================
    // HABIT NAVIGATION
    // ==========================================




    const habitNavHome =
        document.getElementById(
            "habitNavHome"
        );




    const habitNavCalorie =
        document.getElementById(
            "habitNavCalorie"
        );




    const habitNavWeight =
        document.getElementById(
            "habitNavWeight"
        );




    const habitNavHabit =
        document.getElementById(
            "habitNavHabit"
        );




    if (habitNavHome) {




        habitNavHome.addEventListener(
            "click",
            showDashboard
        );


    }




    if (habitNavCalorie) {




        habitNavCalorie.addEventListener(
            "click",
            showCalorieScreen
        );


    }




    if (habitNavWeight) {




        habitNavWeight.addEventListener(
            "click",
            showWeightScreen
        );


    }




    if (habitNavHabit) {




        habitNavHabit.addEventListener(
            "click",
            showHabitScreen
        );


    }


    // ==========================================
    // HABIT TRACKER
    // ==========================================




    const habitDateLabel =
        document.getElementById(
            "habitDateLabel"
        );




    const habitTodayProgress =
        document.getElementById(
            "habitTodayProgress"
        );




    const habitTodayCopy =
        document.getElementById(
            "habitTodayCopy"
        );




    const habitList =
        document.getElementById(
            "habitList"
        );




    const habitWeekTitle =
        document.getElementById(
            "habitWeekTitle"
        );




    const habitWeekGrid =
        document.getElementById(
            "habitWeekGrid"
        );




    const habitPrevWeek =
        document.getElementById(
            "habitPrevWeek"
        );




    const habitNextWeek =
        document.getElementById(
            "habitNextWeek"
        );




    const addHabitButton =
        document.getElementById(
            "addHabitButton"
        );




    const habitModal =
        document.getElementById(
            "habitModal"
        );




    const habitModalTitle =
        document.getElementById(
            "habitModalTitle"
        );




    const habitNameInput =
        document.getElementById(
            "habitNameInput"
        );




    const habitSaveButton =
        document.getElementById(
            "habitSaveButton"
        );




    const habitCancelButton =
        document.getElementById(
            "habitCancelButton"
        );




    let editingHabitId =
        null;




    let activeHabits =
        [];




    let selectedHabitDate =
        getTodayDate();




    let habitWeekOffset =
        0;




    let habitDataCache =
        {};






    // ==========================================
    // DEFAULT HABITS
    // ==========================================




    const DEFAULT_HABITS = [


        {
            name:
                "Minum Air Putih (2L)",


            sort_order:
                1
        },


        {
            name:
                "Makan Sayur & Protein",


            sort_order:
                2
        },


        {
            name:
                "Olahraga / Workout",


            sort_order:
                3
        },


        {
            name:
                "Kurangi Gula",


            sort_order:
                4
        },


        {
            name:
                "Tidur Cukup (7 jam)",


            sort_order:
                5
        }


    ];






    // ==========================================
    // DATE HELPERS
    // ==========================================




    function getTodayDate() {




        const now =
            new Date();




        const year =
            now.getFullYear();




        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );




        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );




        return (
            year +
            "-" +
            month +
            "-" +
            day
        );


    }






    function getDateFromOffset(
        dateString,
        offset
    ) {




        const date =
            new Date(
                dateString +
                "T00:00:00"
            );




        date.setDate(
            date.getDate() +
            offset
        );




        const year =
            date.getFullYear();




        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );




        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );




        return (
            year +
            "-" +
            month +
            "-" +
            day
        );


    }






    function formatHabitDate(
        dateString
    ) {




        const date =
            new Date(
                dateString +
                "T00:00:00"
            );




        return date.toLocaleDateString(
            "id-ID",
            {
                weekday:
                    "long",


                day:
                    "numeric",


                month:
                    "long",


                year:
                    "numeric"
            }
        );


    }






    function getWeekStart(
        dateString
    ) {




        const date =
            new Date(
                dateString +
                "T00:00:00"
            );




        const day =
            date.getDay();




        const diff =
            day === 0
                ? -6
                : 1 - day;




        date.setDate(
            date.getDate() +
            diff
        );




        return (
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )
        );


    }






    function getWeekDates(
        offset
    ) {




        const today =
            getTodayDate();




        const start =
            getWeekStart(
                today
            );




        const shiftedStart =
            getDateFromOffset(
                start,
                offset * 7
            );




        const dates =
            [];




        for (
            let i = 0;
            i < 7;
            i++
        ) {




            dates.push(
                getDateFromOffset(
                    shiftedStart,
                    i
                )
            );


        }




        return dates;


    }






    // ==========================================
    // INITIALIZE HABITS
    // ==========================================




    async function initializeHabits() {




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            data,
            error
        } =
            await window.mphSupabase
                .from(
                    "habits"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "sort_order",
                    {
                        ascending:
                            true
                    }
                );




        if (error) {




            console.error(
                "MPH: Gagal mengambil habits.",
                error
            );




            return;


        }




        if (
            data &&
            data.length > 0
        ) {




            activeHabits =
                data.filter(
                    function (
                        habit
                    ) {




                        return habit.is_active;


                    }
                );




            return;


        }




        const habitsToInsert =
            DEFAULT_HABITS.map(
                function (
                    habit
                ) {




                    return {


                        user_id:
                            user.id,


                        name:
                            habit.name,


                        is_active:
                            true,


                        sort_order:
                            habit.sort_order


                    };


                }
            );




        const {
            data:
                insertedData,


            error:
                insertError
        } =
            await window.mphSupabase
                .from(
                    "habits"
                )
                .insert(
                    habitsToInsert
                )
                .select();




        if (insertError) {




            console.error(
                "MPH: Gagal membuat default habits.",
                insertError
            );




            return;


        }




        activeHabits =
            insertedData ||
            [];


    }






    // ==========================================
    // LOAD HABIT DATA
    // ==========================================




    async function loadHabitDataForDate(
        date
    ) {




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            data,
            error
        } =
            await window.mphSupabase
                .from(
                    "habit_logs"
                )
                .select(
                    "id, habit_id, completed, logged_date"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "logged_date",
                    date
                );




        if (error) {




            console.error(
                "MPH: Gagal mengambil habit logs.",
                error
            );




            return;


        }




        habitDataCache[date] =
            data ||
            [];




        selectedHabitDate =
            date;




        renderHabitDateLabel();




        renderHabitList();




        updateTodayHabitProgress();


    }






    // ==========================================
    // HABIT DATE LABEL
    // ==========================================




    function renderHabitDateLabel() {




        if (!habitDateLabel) {


            return;


        }




        habitDateLabel.textContent =
            formatHabitDate(
                selectedHabitDate
            );


    }






    // ==========================================
    // HABIT PROGRESS
    // ==========================================




    function getCompletedHabitCount(
        date
    ) {




        const logs =
            habitDataCache[
                date
            ] ||
            [];




        return activeHabits.filter(
            function (
                habit
            ) {




                return logs.some(
                    function (
                        log
                    ) {




                        return (
                            log.habit_id ===
                            habit.id &&


                            log.completed ===
                            true
                        );


                    }
                );


            }
        ).length;


    }






    function updateTodayHabitProgress() {




        const total =
            activeHabits.length;




        const completed =
            getCompletedHabitCount(
                selectedHabitDate
            );




        if (habitTodayProgress) {




            habitTodayProgress.textContent =
                completed +
                "/" +
                total;


        }




        if (habitTodayCopy) {




            if (
                total ===
                0
            ) {




                habitTodayCopy.textContent =
                    "Belum ada habit aktif.";


            }


            else if (
                completed ===
                total
            ) {




                habitTodayCopy.textContent =
                    "Semua habit selesai. Mantap!";


            }


            else if (
                completed ===
                0
            ) {




                habitTodayCopy.textContent =
                    "Belum ada habit selesai hari ini.";


            }


            else {




                habitTodayCopy.textContent =
                    completed +
                    " habit selesai hari ini.";


            }


        }


    }






    // ==========================================
    // RENDER HABIT LIST
    // ==========================================




    function renderHabitList() {




        if (!habitList) {


            return;


        }




        habitList.innerHTML =
            "";




        if (
            activeHabits.length ===
            0
        ) {




            habitList.innerHTML = `


                <div class="empty-food">


                    Belum ada habit aktif.


                </div>


            `;




            return;


        }




        const logs =
            habitDataCache[
                selectedHabitDate
            ] ||
            [];




        activeHabits.forEach(
            function (
                habit
            ) {




                const completed =
                    logs.some(
                        function (
                            log
                        ) {




                            return (
                                log.habit_id ===
                                habit.id &&


                                log.completed ===
                                true
                            );


                        }
                    );




                const row =
                    document.createElement(
                        "div"
                    );




                row.className =
                    "habit-row" +
                    (
                        completed
                            ? " completed"
                            : ""
                    );




                row.innerHTML = `


                    <button
                        type="button"
                        class="habit-check ${
                            completed
                                ? "checked"
                                : ""
                        }"
                        aria-label="Checklist habit"
                    >
                        ${
                            completed
                                ? "✓"
                                : ""
                        }
                    </button>




                    <div
                        class="habit-info"
                    >


                        <div
                            class="habit-name ${
                                completed
                                    ? "completed-text"
                                    : ""
                            }"
                        >
                            ${escapeHtml(
                                habit.name
                            )}
                        </div>


                    </div>




                    <div
                        class="habit-manage"
                    >


                        <button
                            type="button"
                            class="edit-habit"
                            aria-label="Edit habit"
                        >
                            ✎
                        </button>




                        <button
                            type="button"
                            class="disable-habit"
                            aria-label="Nonaktifkan habit"
                        >
                            ×
                        </button>


                    </div>


                `;




                row.querySelector(
                    ".habit-check"
                ).addEventListener(
                    "click",
                    async function () {




                        await toggleHabit(
                            habit,
                            !completed
                        );


                    }
                );




                row.querySelector(
                    ".edit-habit"
                ).addEventListener(
                    "click",
                    function () {




                        openHabitModal(
                            habit
                        );


                    }
                );




                row.querySelector(
                    ".disable-habit"
                ).addEventListener(
                    "click",
                    async function () {




                        await disableHabit(
                            habit
                        );


                    }
                );




                habitList.appendChild(
                    row
                );


            }
        );


    }






    // ==========================================
    // TOGGLE HABIT
    // ==========================================




    async function toggleHabit(
        habit,
        completed
    ) {




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            data:
                existingLog,


            error:
                lookupError
        } =
            await window.mphSupabase
                .from(
                    "habit_logs"
                )
                .select(
                    "id"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "habit_id",
                    habit.id
                )
                .eq(
                    "logged_date",
                    selectedHabitDate
                )
                .maybeSingle();




        if (lookupError) {




            console.error(
                "MPH: Gagal mengecek habit log.",
                lookupError
            );




            alert(
                "Checklist gagal diperbarui."
            );




            return;


        }




        let saveError =
            null;




        if (existingLog) {




            const {
                error
            } =
                await window.mphSupabase
                    .from(
                        "habit_logs"
                    )
                    .update({


                        completed:
                            completed


                    })
                    .eq(
                        "id",
                        existingLog.id
                    )
                    .eq(
                        "user_id",
                        user.id
                    );




            saveError =
                error;


        }


        else {




            const {
                error
            } =
                await window.mphSupabase
                    .from(
                        "habit_logs"
                    )
                    .insert({


                        user_id:
                            user.id,


                        habit_id:
                            habit.id,


                        logged_date:
                            selectedHabitDate,


                        completed:
                            completed


                    });




            saveError =
                error;


        }




        if (saveError) {




            console.error(
                "MPH: Gagal menyimpan habit.",
                saveError
            );




            alert(
                "Checklist gagal disimpan."
            );




            return;


        }




        await loadHabitDataForDate(
            selectedHabitDate
        );




        await renderHabitWeek();




        await loadHomeHabit();


    }






    // ==========================================
    // WEEKLY HABIT
    // ==========================================




    async function renderHabitWeek() {




        if (!habitWeekGrid) {


            return;


        }




        const dates =
            getWeekDates(
                habitWeekOffset
            );




        if (habitWeekTitle) {




            const firstDate =
                new Date(
                    dates[0] +
                    "T00:00:00"
                );




            const lastDate =
                new Date(
                    dates[6] +
                    "T00:00:00"
                );




            habitWeekTitle.textContent =
                firstDate.toLocaleDateString(
                    "id-ID",
                    {
                        day:
                            "numeric",


                        month:
                            "short"
                    }
                ) +
                " – " +
                lastDate.toLocaleDateString(
                    "id-ID",
                    {
                        day:
                            "numeric",


                        month:
                            "short",


                        year:
                            "numeric"
                    }
                );


        }




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            data,
            error
        } =
            await window.mphSupabase
                .from(
                    "habit_logs"
                )
                .select(
                    "habit_id, logged_date, completed"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .gte(
                    "logged_date",
                    dates[0]
                )
                .lte(
                    "logged_date",
                    dates[6]
                );




        if (error) {




            console.error(
                "MPH: Gagal mengambil weekly habit logs.",
                error
            );




            return;


        }




        dates.forEach(
            function (
                date
            ) {




                habitDataCache[
                    date
                ] =
                    (
                        data ||
                        []
                    ).filter(
                        function (
                            log
                        ) {




                            return (
                                log.logged_date ===
                                date
                            );


                        }
                    );


            }
        );




        habitWeekGrid.innerHTML =
            "";




        const today =
            getTodayDate();




        dates.forEach(
            function (
                date
            ) {




                const completed =
                    getCompletedHabitCount(
                        date
                    );




                const total =
                    activeHabits.length;




                const day =
                    document.createElement(
                        "button"
                    );




                day.type =
                    "button";




                day.className =
                    "habit-day" +
                    (
                        date ===
                        selectedHabitDate
                            ? " active"
                            : ""
                    ) +
                    (
                        date ===
                        today
                            ? " today"
                            : ""
                    );




                day.innerHTML = `


                    <span
                        class="habit-day-label"
                    >
                        ${escapeHtml(
                            new Date(
                                date +
                                "T00:00:00"
                            ).toLocaleDateString(
                                "id-ID",
                                {
                                    weekday:
                                        "short"
                                }
                            )
                        )}
                    </span>




                    <span
                        class="habit-day-number"
                    >
                        ${new Date(
                            date +
                            "T00:00:00"
                        ).getDate()}
                    </span>




                    <span
                        class="habit-day-progress"
                    >
                        ${completed}/${total}
                    </span>


                `;




                day.addEventListener(
                    "click",
                    async function () {




                        await loadHabitDataForDate(
                            date
                        );




                        await renderHabitWeek();


                    }
                );




                habitWeekGrid.appendChild(
                    day
                );


            }
        );


    }






    // ==========================================
    // WEEK NAVIGATION
    // ==========================================




    if (habitPrevWeek) {




        habitPrevWeek.addEventListener(
            "click",
            async function () {




                habitWeekOffset -=
                    1;




                await renderHabitWeek();


            }
        );


    }




    if (habitNextWeek) {




        habitNextWeek.addEventListener(
            "click",
            async function () {




                habitWeekOffset +=
                    1;




                await renderHabitWeek();


            }
        );


    }






    // ==========================================
    // HABIT MODAL
    // ==========================================




    function openHabitModal(
        habit = null
    ) {




        editingHabitId =
            habit
                ? habit.id
                : null;




        if (habitModalTitle) {




            habitModalTitle.textContent =
                habit
                    ? "Edit Habit"
                    : "Tambah Habit";


        }




        if (habitNameInput) {




            habitNameInput.value =
                habit
                    ? habit.name
                    : "";


        }




        if (habitModal) {




            habitModal.classList.add(
                "show"
            );


        }




        if (habitNameInput) {




            setTimeout(
                function () {




                    habitNameInput.focus();


                },
                50
            );


        }


    }






    function closeHabitModalWindow() {




        editingHabitId =
            null;




        if (habitModal) {




            habitModal.classList.remove(
                "show"
            );


        }


    }






    if (addHabitButton) {




        addHabitButton.addEventListener(
            "click",
            function () {




                openHabitModal();


            }
        );


    }






    if (habitCancelButton) {




        habitCancelButton.addEventListener(
            "click",
            closeHabitModalWindow
        );


    }






    if (habitModal) {




        habitModal.addEventListener(
            "click",
            function (
                event
            ) {




                if (
                    event.target ===
                    habitModal
                ) {




                    closeHabitModalWindow();


                }


            }
        );


    }






    // ==========================================
    // SAVE HABIT
    // ==========================================




    if (habitSaveButton) {




        habitSaveButton.addEventListener(
            "click",
            async function () {




                const name =
                    habitNameInput
                        ? habitNameInput.value.trim()
                        : "";




                if (!name) {




                    alert(
                        "Masukkan nama habit."
                    );




                    return;


                }




                const user =
                    await getCurrentUser();




                if (!user) {




                    alert(
                        "Session login tidak ditemukan."
                    );




                    return;


                }




                habitSaveButton.disabled =
                    true;




                habitSaveButton.textContent =
                    "Menyimpan...";




                let saveError =
                    null;




                if (
                    editingHabitId
                ) {




                    const {
                        error
                    } =
                        await window.mphSupabase
                            .from(
                                "habits"
                            )
                            .update({


                                name:
                                    name


                            })
                            .eq(
                                "id",
                                editingHabitId
                            )
                            .eq(
                                "user_id",
                                user.id
                            );




                    saveError =
                        error;


                }


                else {




                    const nextSort =
                        activeHabits.length >
                        0


                            ? Math.max(
                                ...activeHabits.map(
                                    function (
                                        habit
                                    ) {




                                        return (
                                            Number(
                                                habit.sort_order
                                            ) ||
                                            0
                                        );


                                    }
                                )
                            ) + 1


                            : 1;




                    const {
                        error
                    } =
                        await window.mphSupabase
                            .from(
                                "habits"
                            )
                            .insert({


                                user_id:
                                    user.id,


                                name:
                                    name,


                                is_active:
                                    true,


                                sort_order:
                                    nextSort


                            });




                    saveError =
                        error;


                }




                habitSaveButton.disabled =
                    false;




                habitSaveButton.textContent =
                    "Simpan";




                if (saveError) {




                    console.error(
                        "MPH: Gagal menyimpan habit.",
                        saveError
                    );




                    alert(
                        "Habit gagal disimpan."
                    );




                    return;


                }




                closeHabitModalWindow();




                await initializeHabits();




                await loadHabitDataForDate(
                    selectedHabitDate
                );




                await renderHabitWeek();




                await loadHomeHabit();


            }
        );


    }






    // ==========================================
    // DOWNLOAD HABIT DATA
    // ==========================================

    async function downloadHabitData() {

        const button =
            document.getElementById(
                "downloadHabitData"
            );

        if (!button) {
            return;
        }

        const user =
            await getCurrentUser();

        if (!user) {
            return;
        }

        button.disabled = true;

        try {

            // Export only real saved activity inside the rolling 6-month
            // window. Do not generate fake rows for dates before the user
            // started using the tracker.
            const {
                data: logs,
                error: logError
            } =
                await window.mphSupabase
                    .from(
                        "habit_logs"
                    )
                    .select(
                        "habit_id, completed, logged_date"
                    )
                    .eq(
                        "user_id",
                        user.id
                    )
                    .gte(
                        "logged_date",
                        getSixMonthsAgo()
                    )
                    .lte(
                        "logged_date",
                        getTodayDate()
                    )
                    .order(
                        "logged_date",
                        {
                            ascending:
                                false
                        }
                    );

            if (logError) {
                console.error(
                    "MPH: Gagal mengambil habit logs untuk CSV.",
                    logError
                );

                alert(
                    "Data habit gagal diambil."
                );

                return;
            }

            if (!logs || logs.length === 0) {
                alert(
                    "Belum ada data habit yang tersimpan dalam 6 bulan terakhir."
                );
                return;
            }

            // Keep every habit that has real history in the export window,
            // including habits that are now inactive. The column must stay so
            // old history is never silently removed.
            const {
                data: habits,
                error: habitError
            } =
                await window.mphSupabase
                    .from(
                        "habits"
                    )
                    .select(
                        "*"
                    )
                    .eq(
                        "user_id",
                        user.id
                    )
                    .order(
                        "sort_order",
                        {
                            ascending:
                                true
                        }
                    );

            if (habitError) {
                console.error(
                    "MPH: Gagal mengambil habits untuk CSV.",
                    habitError
                );

                alert(
                    "Data habit gagal diambil."
                );

                return;
            }

            const loggedHabitIds =
                new Set(
                    logs.map(function(log) {
                        return log.habit_id;
                    })
                );

            // YYYY-MM-DD only. Using the date portion avoids timezone shifts
            // when created_at / updated_at are ISO timestamps.
            function toDateOnly(value) {
                if (!value) {
                    return "";
                }

                const text = String(value);

                if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
                    return text;
                }

                const parsed = new Date(text);

                if (!Number.isNaN(parsed.getTime())) {
                    return [
                        parsed.getFullYear(),
                        String(parsed.getMonth() + 1).padStart(2, "0"),
                        String(parsed.getDate()).padStart(2, "0")
                    ].join("-");
                }

                const match = text.match(/(\d{4}-\d{2}-\d{2})/);
                return match ? match[1] : "";
            }


            // Last real log per habit. This is also a safe fallback for older
            // rows if the habits table does not have an updated_at/deactivated
            // timestamp available.
            const lastLogDateByHabit =
                new Map();

            logs.forEach(function(log) {
                const date = toDateOnly(log.logged_date);
                const current =
                    lastLogDateByHabit.get(log.habit_id) || "";

                if (!current || date > current) {
                    lastLogDateByHabit.set(
                        log.habit_id,
                        date
                    );
                }
            });

            // Determine the active interval for every habit.
            //
            // - New habits become active from created_at.
            // - Active habits remain active through today.
            // - Inactive habits stop on deactivated_at when available.
            // - If the database has no deactivated_at, use updated_at when it
            //   exists; otherwise use the last real log date as a safe legacy
            //   fallback. This prevents inactive habits from inflating totals.
            const allHabitPeriods =
                (habits || []).map(function(habit) {
                    const startDate =
                        toDateOnly(habit.created_at) ||
                        getSixMonthsAgo();

                    let endDate =
                        getTodayDate();

                    if (!habit.is_active) {
                        const explicitEnd =
                            toDateOnly(habit.deactivated_at);

                        const updatedEnd =
                            toDateOnly(habit.updated_at);

                        const lastLog =
                            lastLogDateByHabit.get(habit.id) || "";

                        endDate =
                            explicitEnd ||
                            updatedEnd ||
                            lastLog;
                    }

                    return {
                        habit: habit,
                        startDate: startDate,
                        endDate: endDate
                    };
                });

            const habitPeriods =
                allHabitPeriods.filter(function(period) {
                    const overlapsExportWindow =
                        (!period.endDate || period.endDate >= getSixMonthsAgo()) &&
                        period.startDate <= getTodayDate();

                    // Keep currently active habits even if they have no
                    // completed/unchecked log yet, so a newly-added habit
                    // still gets its own column and earlier dates show "—".
                    // Inactive habits are kept only when they have real logs
                    // in the export window.
                    return overlapsExportWindow &&
                        (period.habit.is_active || loggedHabitIds.has(period.habit.id));
                });

            const exportHabits =
                habitPeriods.map(function(period) {
                    return period.habit;
                });

            if (exportHabits.length === 0) {
                alert(
                    "Belum ada data habit yang tersimpan dalam 6 bulan terakhir."
                );
                return;
            }

            function isHabitActiveOnDate(
                period,
                date
            ) {
                if (!period.startDate || date < period.startDate) {
                    return false;
                }

                if (
                    period.endDate &&
                    date > period.endDate
                ) {
                    return false;
                }

                return true;
            }

            const logsByDate =
                new Map();

            logs.forEach(function(log) {
                if (!logsByDate.has(log.logged_date)) {
                    logsByDate.set(
                        log.logged_date,
                        []
                    );
                }

                logsByDate
                    .get(log.logged_date)
                    .push(log);
            });

            const rows = [
                [
                    "Tanggal",
                    ...exportHabits.map(function(habit) {
                        return habit.is_active
                            ? habit.name
                            : habit.name + " (inactive)";
                    }),
                    "Selesai",
                    "Total Habit"
                ]
            ];

            Array.from(logsByDate.keys())
                .sort(function(a, b) {
                    return String(b).localeCompare(String(a));
                })
                .forEach(function(date) {

                    const dateLogs =
                        logsByDate.get(date) || [];

                    const completedIds =
                        new Set(
                            dateLogs
                                .filter(function(log) {
                                    return log.completed === true;
                                })
                                .map(function(log) {
                                    return log.habit_id;
                                })
                        );

                    const activePeriods =
                        habitPeriods.filter(function(period) {
                            return isHabitActiveOnDate(
                                period,
                                date
                            );
                        });

                    const activeHabitIds =
                        new Set(
                            activePeriods.map(function(period) {
                                return period.habit.id;
                            })
                        );

                    const completedCount =
                        activePeriods.filter(function(period) {
                            return completedIds.has(
                                period.habit.id
                            );
                        }).length;

                    const dateParts =
                        String(date || "").split("-");

                    const exportDate =
                        dateParts.length === 3
                            ? dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0]
                            : date;

                    rows.push([
                        exportDate,
                        ...habitPeriods.map(function(period) {
                            const habit = period.habit;

                            if (date < period.startDate) {
                                return "—";
                            }

                            if (
                                !habit.is_active &&
                                period.endDate &&
                                date > period.endDate
                            ) {
                                return "Tidak aktif";
                            }

                            if (!activeHabitIds.has(habit.id)) {
                                return "—";
                            }

                            return completedIds.has(habit.id)
                                ? "Selesai"
                                : "Belum";
                        }),
                        completedCount,
                        activePeriods.length
                    ]);

                });

            const csv =
                rows
                    .map(function(row) {

                        return row
                            .map(function(value) {

                                const csvText =
                                    String(
                                        value === null ||
                                        value === undefined
                                            ? ""
                                            : value
                                    );

                                return '"' +
                                    csvText.replace(
                                        /"/g,
                                        '""'
                                    ) +
                                    '"';

                            })
                            .join(",");

                    })
                    .join("\r\n");

            const csvWithBom =
                "\uFEFF" +
                csv;

            const blob =
                new Blob(
                    [csvWithBom],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href =
                url;

            link.download =
                "MPH-Habit-Tracker-6-Bulan.csv";

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            URL.revokeObjectURL(
                url
            );

        } finally {

            button.disabled = false;

        }

    }

    const downloadHabitDataButton =
        document.getElementById(
            "downloadHabitData"
        );

    if (downloadHabitDataButton) {

        downloadHabitDataButton.addEventListener(
            "click",
            downloadHabitData
        );

    }


    // ==========================================
    // DISABLE HABIT
    // ==========================================




    async function disableHabit(
        habit
    ) {




        const confirmed =
            confirm(
                'Nonaktifkan habit "' +
                habit.name +
                '"? Riwayatnya tetap akan disimpan.'
            );




        if (!confirmed) {


            return;


        }




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            error
        } =
            await window.mphSupabase
                .from(
                    "habits"
                )
                .update({


                    is_active:
                        false


                })
                .eq(
                    "id",
                    habit.id
                )
                .eq(
                    "user_id",
                    user.id
                );




        if (error) {




            console.error(
                "MPH: Gagal menonaktifkan habit.",
                error
            );




            alert(
                "Habit gagal dinonaktifkan."
            );




            return;


        }




        await initializeHabits();




        await loadHabitDataForDate(
            selectedHabitDate
        );




        await renderHabitWeek();




        await loadHomeHabit();


    }






    // ==========================================
    // HOME HABIT PROGRESS
    // ==========================================




    // ==========================================
    // DAY STREAK
    // A day counts only when ALL active habits
    // are completed for that date.
    // Today must also be complete for the current
    // streak to be greater than 0.
    // ==========================================


    async function updateHomeStreak(
        user,
        activeHabits
    ) {

        const streakNumber =
            document.getElementById(
                "streakNumber"
            );

        if (
            !streakNumber ||
            !user
        ) {
            return;
        }

        const STREAK_KEY =
            "mph_login_streak";

        let streakData =
            null;

        try {

            streakData =
                JSON.parse(
                    localStorage.getItem(
                        STREAK_KEY
                    )
                );

        } catch (error) {

            streakData =
                null;

        }

        const today =
            getTodayDate();

        if (
            !streakData ||
            !streakData.lastDate ||
            !Number.isFinite(
                Number(
                    streakData.streak
                )
            )
        ) {

            streakData = {

                lastDate:
                    today,

                streak:
                    1

            };

        }

        else {

            const lastDate =
                new Date(
                    streakData.lastDate +
                    "T00:00:00"
                );

            const currentDate =
                new Date(
                    today +
                    "T00:00:00"
                );

            const diffMs =
                currentDate.getTime() -
                lastDate.getTime();

            const diffDays =
                Math.floor(
                    diffMs /
                    (1000 * 60 * 60 * 24)
                );

            if (
                diffDays > 0
            ) {

                streakData.streak +=
                    diffDays;

                streakData.lastDate =
                    today;

            }

        }

        localStorage.setItem(
            STREAK_KEY,
            JSON.stringify(
                streakData
            )
        );

        streakNumber.textContent =
            "🔥 " +
            streakData.streak;

    }


    async function loadHomeHabit() {




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            data:
                habits,


            error:
                habitError
        } =
            await window.mphSupabase
                .from(
                    "habits"
                )
                .select(
                    "id, name, is_active, sort_order"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "is_active",
                    true
                )
                .order(
                    "sort_order",
                    {
                        ascending:
                            true
                    }
                );




        if (habitError) {




            console.error(
                "MPH: Gagal mengambil Home habits.",
                habitError
            );




            return;


        }




        if (
            !habits ||
            habits.length ===
            0
        ) {


            await updateHomeStreak(
                user,
                []
            );

            return;


        }

        await updateHomeStreak(
            user,
            habits
        );




        const {
            data:
                logs,


            error:
                logError
        } =
            await window.mphSupabase
                .from(
                    "habit_logs"
                )
                .select(
                    "habit_id, logged_date, completed"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "logged_date",
                    getTodayDate()
                );




        if (logError) {




            console.error(
                "MPH: Gagal mengambil Home habit logs.",
                logError
            );




            return;


        }




        const completedIds =
            new Set(
                (
                    logs ||
                    []
                )
                    .filter(
                        function (
                            log
                        ) {




                            return (
                                log.completed ===
                                true
                            );


                        }
                    )
                    .map(
                        function (
                            log
                        ) {




                            return log.habit_id;


                        }
                    )
            );




        const completed =
            habits.filter(
                function (
                    habit
                ) {




                    return completedIds.has(
                        habit.id
                    );


                }
            ).length;




        const total =
            habits.length;




        // Home has two habit summaries:
        // 1) Today's Progress (top)
        // 2) Habit Tracker card (bottom)
        // Keep both in sync from the same fresh Supabase result.

        const homeHabitProgressTop =
            document.getElementById(
                "homeHabitProgressTop"
            );

        const homeHabitNoteTop =
            document.getElementById(
                "homeHabitNoteTop"
            );

        const homeHabitProgress =
            document.getElementById(
                "homeHabitProgress"
            );

        const homeHabitNote =
            document.getElementById(
                "homeHabitNote"
            );

        const homeHabitWeek =
            document.getElementById(
                "homeHabitWeek"
            );

        if (homeHabitProgressTop) {
            homeHabitProgressTop.innerHTML =
                completed +
                " <span>/ " +
                total +
                "</span>";
        }

        const habitNote =
            completed === total
                ? "Semua habit selesai. Mantap!"
                : completed === 0
                    ? "Belum ada habit selesai"
                    : completed +
                      " habit selesai hari ini";

        if (homeHabitNoteTop) {
            homeHabitNoteTop.textContent =
                habitNote;
        }

        if (homeHabitProgress) {
            homeHabitProgress.innerHTML =
                completed +
                " <small>/ " +
                total +
                " selesai hari ini</small>";
        }

        if (homeHabitNote) {
            homeHabitNote.textContent =
                habitNote;
        }


        if (
            homeHabitWeek
        ) {




            const dates =
                getWeekDates(
                    0
                );




            const {
                data:
                    weekLogs,


                error:
                    weekError
            } =
                await window.mphSupabase
                    .from(
                        "habit_logs"
                    )
                    .select(
                        "habit_id, logged_date, completed"
                    )
                    .eq(
                        "user_id",
                        user.id
                    )
                    .gte(
                        "logged_date",
                        dates[0]
                    )
                    .lte(
                        "logged_date",
                        dates[6]
                    );




            if (!weekError) {




                homeHabitWeek.innerHTML =
                    "";




                dates.forEach(
                    function (
                        date
                    ) {




                        const completedForDay =
                            (
                                weekLogs ||
                                []
                            ).filter(
                                function (
                                    log
                                ) {




                                    return (
                                        log.logged_date ===
                                        date &&


                                        log.completed ===
                                        true
                                    );


                                }
                            ).length;




                        const day =
                            document.createElement(
                                "div"
                            );




                        day.className =
                            "day";




                        const circle =
                            document.createElement(
                                "div"
                            );




                        circle.className =
                            "day-circle";




                        if (
                            completedForDay ===
                            total
                        ) {




                            circle.style.background =
                                "#679343";




                            circle.style.borderColor =
                                "#679343";


                        }


                        else if (
                            completedForDay >
                            0
                        ) {




                            circle.style.background =
                                "#dce8a9";




                            circle.style.borderColor =
                                "#b9c98f";


                        }




                        day.textContent =
                            new Date(
                                date +
                                "T00:00:00"
                            )
                                .toLocaleDateString(
                                    "id-ID",
                                    {
                                        weekday:
                                            "short"
                                    }
                                )
                                .slice(
                                    0,
                                    1
                                );




                        day.appendChild(
                            circle
                        );




                        homeHabitWeek.appendChild(
                            day
                        );


                    }
                );


            }


        }


    }


    // ==========================================
    // CALORIE ELEMENTS
    // ==========================================




    const dailyTarget =
        document.getElementById(
            "dailyTarget"
        );




    const dailyConsumed =
        document.getElementById(
            "dailyConsumed"
        );




    const dailyRemaining =
        document.getElementById(
            "dailyRemaining"
        );




    const dailyTotal =
        document.getElementById(
            "dailyTotal"
        );




    const foodList =
        document.getElementById(
            "foodList"
        );




    const foodCount =
        document.getElementById(
            "foodCount"
        );




    const foodName =
        document.getElementById(
            "foodName"
        );


    const foodSuggestions =
        document.getElementById(
            "foodSuggestions"
        );


    const foodSelectedInfo =
        document.getElementById(
            "foodSelectedInfo"
        );


    const foodCalories =
        document.getElementById(
            "foodCalories"
        );




    const foodQuantity =
        document.getElementById(
            "foodQuantity"
        );




    const foodUnit =
        document.getElementById(
            "foodUnit"
        );




    const addFoodButton =
        document.getElementById(
            "addFoodButton"
        );




    const calculateNeedsButton =
        document.getElementById(
            "calculateNeedsButton"
        );




    const ageInput =
        document.getElementById(
            "age"
        );




    const heightInput =
        document.getElementById(
            "height"
        );




    const weightInput =
        document.getElementById(
            "weight"
        );




    const activityInput =
        document.getElementById(
            "activity"
        );




    const goalInput =
        document.getElementById(
            "goal"
        );




    const resultBmr =
        document.getElementById(
            "resultBmr"
        );




    const resultTdee =
        document.getElementById(
            "resultTdee"
        );




    const resultTarget =
        document.getElementById(
            "resultTarget"
        );




    const resultMessage =
        document.getElementById(
            "resultMessage"
        );




    const genderButtons =
        document.querySelectorAll(
            ".gender-button"
        );




    let selectedGender =
        "female";




    let todayFoodLogs =
        [];






    // ==========================================
    // FORMAT NUMBER
    // ==========================================




    function formatNumber(
        number
    ) {




        return Number(
            number || 0
        ).toLocaleString(
            "id-ID",
            {
                maximumFractionDigits:
                    1
            }
        );


    }






    // ==========================================
    // FOOD DATABASE SEARCH
    // ==========================================

    let selectedFood = null;
    let foodSearchTimer = null;

    if (foodQuantity) {
        foodQuantity.addEventListener(
            "input",
            function() {
                updateFoodCaloriePreview();
            }
        );
    }

    function hideFoodSuggestions() {
        if (foodSuggestions) {
            foodSuggestions.style.display = "none";
            foodSuggestions.innerHTML = "";
        }
    }

    function clearSelectedFood() {
        selectedFood = null;

        if (foodCalories) {
            foodCalories.value = "";
            foodCalories.placeholder = "Pilih makanan";
        }

        if (foodSelectedInfo) {
            foodSelectedInfo.style.display = "none";
            foodSelectedInfo.textContent = "";
        }

        if (foodUnit) {
            foodUnit.disabled = false;
        }
    }

    function updateFoodCaloriePreview() {

        if (!selectedFood || !foodCalories || !foodQuantity) {
            return;
        }

        const baseCalories = Number(selectedFood.calories || 0);
        const servingSize = Number(selectedFood.serving_size || 0);
        const quantity = Number(foodQuantity.value || 0);

        if (baseCalories > 0 && servingSize > 0 && quantity > 0) {
            foodCalories.value = Number(
                (baseCalories * (quantity / servingSize)).toFixed(1)
            );
        } else {
            foodCalories.value = "";
        }
    }


    function applySelectedFood(food) {

        if (!food || (food.food_state && food.food_state !== "ready_to_eat")) {
            return;
        }

        selectedFood = food;

        if (foodName) {
            foodName.value = food.name || "";
        }

        if (foodCalories) {
            foodCalories.placeholder = "";
        }

        if (foodQuantity) {
            foodQuantity.value = Number(food.serving_size || 1);
        }

        if (foodUnit) {
            const unit = String(food.serving_unit || "g");
            const optionExists = Array.from(foodUnit.options).some(
                function(option) {
                    return option.value === unit;
                }
            );

            if (!optionExists) {
                const option = document.createElement("option");
                option.value = unit;
                option.textContent = unit;
                foodUnit.appendChild(option);
            }

            foodUnit.value = unit;
            foodUnit.disabled = true;
        }

        if (foodSelectedInfo) {
            foodSelectedInfo.textContent =
                "Dasar: " +
                formatNumber(food.calories) +
                " kcal / " +
                formatNumber(food.serving_size) +
                " " +
                food.serving_unit;
            foodSelectedInfo.style.display = "block";
        }

        updateFoodCaloriePreview();
        hideFoodSuggestions();
    }

    function renderFoodSuggestions(foods) {
        if (!foodSuggestions) return;

        foodSuggestions.innerHTML = "";

        if (!foods || foods.length === 0) {
            foodSuggestions.innerHTML =
                '<div class="food-suggestion-item" style="cursor:default;">' +
                '<span class="food-suggestion-name">Makanan tidak ditemukan</span>' +
                '<span class="food-suggestion-meta">Coba kata kunci lain.</span>' +
                '</div>';
            foodSuggestions.style.display = "block";
            return;
        }

        foods.forEach(function(food) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "food-suggestion-item";
            button.innerHTML =
                '<span class="food-suggestion-name">' +
                escapeHtml(food.name) +
                '</span>' +
                '<span class="food-suggestion-meta">' +
                escapeHtml(food.category || "") +
                ' • ' +
                formatNumber(food.calories) +
                ' kcal / ' +
                formatNumber(food.serving_size) +
                ' ' +
                escapeHtml(food.serving_unit || "") +
                '</span>';

            button.addEventListener("click", function() {
                applySelectedFood(food);
            });

            foodSuggestions.appendChild(button);
        });

        foodSuggestions.style.display = "block";
    }

    async function searchFoodItems(query) {
        const searchTerm = query.trim();

        if (!searchTerm) {
            hideFoodSuggestions();
            return;
        }

        const escapedSearch =
            searchTerm
                .replace(/%/g, "\\%")
                .replace(/_/g, "\\_");

        const { data, error } =
            await window.mphSupabase
                .from("food_items")
                .select(
                    "id, name, category, calories, serving_size, serving_unit, food_state"
                )
                .eq(
                    "food_state",
                    "ready_to_eat"
                )
                .ilike(
                    "name",
                    "%" + escapedSearch + "%"
                )
                .order(
                    "name",
                    { ascending: true }
                )
                .limit(50);

        if (error) {
            console.error(
                "MPH: Gagal mencari makanan.",
                error
            );
            hideFoodSuggestions();
            return;
        }

        const normalized =
            searchTerm.toLowerCase();

        const rankedFoods =
            (data || [])
                .sort(function(a, b) {
                    const aName =
                        (a.name || "").toLowerCase();
                    const bName =
                        (b.name || "").toLowerCase();

                    function score(name) {
                        if (name === normalized) return 0;
                        if (name.startsWith(normalized + " ")) return 1;
                        if (name.startsWith(normalized)) return 2;
                        return 3;
                    }

                    const diff =
                        score(aName) - score(bName);

                    if (diff !== 0) return diff;
                    return aName.localeCompare(bName);
                })
                .slice(0, 20);

        renderFoodSuggestions(rankedFoods);
    }


    if (foodName) {
        foodName.addEventListener("input", function() {
            clearSelectedFood();
            clearTimeout(foodSearchTimer);

            const query = foodName.value.trim();
            if (!query) {
                hideFoodSuggestions();
                return;
            }

            foodSearchTimer = setTimeout(function() {
                searchFoodItems(query);
            }, 250);
        });

        foodName.addEventListener("focus", function() {
            if (foodName.value.trim()) {
                searchFoodItems(foodName.value.trim());
            }
        });
    }

    document.addEventListener("click", function(event) {
        if (
            foodSuggestions &&
            foodName &&
            !foodName.contains(event.target) &&
            !foodSuggestions.contains(event.target)
        ) {
            hideFoodSuggestions();
        }
    });


    // ==========================================
    // DAILY FOOD LOGS
    // ==========================================




    async function loadDailyFoodLogs() {




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            data,
            error
        } =
            await window.mphSupabase
                .from(
                    "daily_food_logs"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "log_date",
                    getTodayDate()
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );




        if (error) {




            console.error(
                "MPH: Gagal mengambil food logs.",
                error
            );




            return;


        }




        todayFoodLogs =
            data ||
            [];




        renderDailyFood();


    }






    function renderDailyFood() {




        if (!foodList) {


            return;


        }




        foodList.innerHTML =
            "";




        if (
            todayFoodLogs.length ===
            0
        ) {




            foodList.innerHTML = `


                <div class="empty-food">


                    Belum ada makanan hari ini.


                </div>


            `;


        }




        todayFoodLogs.forEach(
            function (
                food
            ) {




                const row =
                    document.createElement(
                        "div"
                    );




                row.className =
                    "food-row";




                row.innerHTML = `


                    <div
                        class="food-row-icon"
                    >
                        🍽️
                    </div>




                    <div
                        class="food-row-content"
                    >


                        <div
                            class="food-row-name"
                        >
                            ${escapeHtml(
                                food.food_name
                            )}
                        </div>




                        <div
                            class="food-row-detail"
                        >
                            ${food.quantity}
                            ${escapeHtml(
                                food.unit
                            )}
                        </div>


                    </div>




                    <div
                        class="food-row-calories"
                    >
                        ${formatNumber(
                            food.calories
                        )}
                        kcal
                    </div>




                    <button
                        class="delete-food"
                        type="button"
                    >
                        ×
                    </button>


                `;




                row.querySelector(
                    ".delete-food"
                ).addEventListener(
                    "click",
                    async function () {




                        await deleteFood(
                            food.id
                        );


                    }
                );




                foodList.appendChild(
                    row
                );


            }
        );




        const total =
            todayFoodLogs.reduce(
                function (
                    sum,
                    food
                ) {




                    return (
                        sum +
                        Number(
                            food.calories
                        )
                    );


                },
                0
            );




        if (dailyTotal) {




            dailyTotal.textContent =
                formatNumber(
                    total
                );


        }




        if (dailyConsumed) {




            dailyConsumed.textContent =
                formatNumber(
                    total
                );


        }




        if (foodCount) {




            foodCount.textContent =
                todayFoodLogs.length +
                " item";


        }




        updateDailyRemaining(
            total
        );


    }






    function updateDailyRemaining(
        consumed
    ) {




        const savedTarget =
            localStorage.getItem(
                "mph_calorie_target"
            );




        if (!savedTarget) {




            if (dailyTarget) {




                dailyTarget.textContent =
                    "—";


            }




            if (dailyRemaining) {




                dailyRemaining.textContent =
                    "—";


            }




            return;


        }




        const target =
            Number(
                savedTarget
            );




        const remaining =
            target -
            consumed;




        if (dailyTarget) {




            dailyTarget.textContent =
                formatNumber(
                    target
                );


        }




        if (dailyRemaining) {




            dailyRemaining.textContent =
                formatNumber(
                    Math.max(
                        0,
                        remaining
                    )
                );


        }


    }






    // ==========================================
    // ADD FOOD
    // ==========================================

    if (addFoodButton) {

        addFoodButton.addEventListener(
            "click",
            async function() {

                if (!selectedFood) {
                    alert(
                        "Pilih makanan dari hasil pencarian terlebih dahulu."
                    );

                    if (foodName) {
                        foodName.focus();
                    }

                    return;
                }

                if (
                    selectedFood.food_state &&
                    selectedFood.food_state !== "ready_to_eat"
                ) {
                    alert("Pilih makanan yang siap dimakan.");
                    return;
                }

                const name = selectedFood.name;
                const baseCalories = Number(selectedFood.calories);
                const servingSize = Number(selectedFood.serving_size);
                const quantity = foodQuantity ? Number(foodQuantity.value) : 0;
                const unit = foodUnit ? foodUnit.value : selectedFood.serving_unit;

                if (
                    !baseCalories ||
                    baseCalories <= 0 ||
                    !servingSize ||
                    servingSize <= 0
                ) {
                    alert("Data kalori makanan ini tidak lengkap.");
                    return;
                }

                if (!quantity || quantity <= 0) {
                    alert("Masukkan jumlah makanan.");
                    return;
                }

                const user = await getCurrentUser();

                if (!user) {
                    alert("Session login tidak ditemukan.");
                    return;
                }

                addFoodButton.disabled = true;
                addFoodButton.textContent = "Menyimpan...";

                const totalCalories =
                    baseCalories * (quantity / servingSize);

                const { error } =
                    await window.mphSupabase
                        .from("daily_food_logs")
                        .insert({
                            user_id: user.id,
                            food_name: name,
                            calories: Number(totalCalories.toFixed(1)),
                            quantity: quantity,
                            unit: unit,
                            log_date: getTodayDate()
                        });

                addFoodButton.disabled = false;
                addFoodButton.textContent = "+ Tambahkan Makanan";

                if (error) {
                    console.error(
                        "MPH: Gagal menyimpan makanan.",
                        error
                    );

                    alert("Makanan gagal disimpan.");
                    return;
                }

                if (foodName) {
                    foodName.value = "";
                }

                clearSelectedFood();

                if (foodQuantity) {
                    foodQuantity.value = "1";
                }

                if (foodUnit) {
                    foodUnit.disabled = false;
                    foodUnit.value = "porsi";
                }

                await loadDailyFoodLogs();
            }
        );
    }




    // ==========================================
    // DELETE FOOD
    // ==========================================




    async function deleteFood(
        id
    ) {




        const confirmed =
            confirm(
                "Hapus makanan ini dari catatan hari ini?"
            );




        if (!confirmed) {


            return;


        }




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            error
        } =
            await window.mphSupabase
                .from(
                    "daily_food_logs"
                )
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "user_id",
                    user.id
                );




        if (error) {




            console.error(
                "MPH: Gagal menghapus makanan.",
                error
            );




            alert(
                "Makanan gagal dihapus."
            );




            return;


        }




        await loadDailyFoodLogs();


    }






    // ==========================================
    // GENDER SELECTION
    // ==========================================




    genderButtons.forEach(
        function (
            button
        ) {




            button.addEventListener(
                "click",
                function () {




                    genderButtons.forEach(
                        function (
                            item
                        ) {




                            item.classList.remove(
                                "active"
                            );


                        }
                    );




                    button.classList.add(
                        "active"
                    );




                    selectedGender =
                        button.dataset.gender;


                }
            );


        }
    );






    // ==========================================
    // CALORIE NEEDS CALCULATOR
    // ==========================================




    if (calculateNeedsButton) {




        calculateNeedsButton.addEventListener(
            "click",
            function () {




                const age =
                    ageInput
                        ? Number(
                            ageInput.value
                        )
                        : 0;




                const height =
                    heightInput
                        ? Number(
                            heightInput.value
                        )
                        : 0;




                const weight =
                    weightInput
                        ? Number(
                            weightInput.value
                        )
                        : 0;




                const activity =
                    activityInput
                        ? Number(
                            activityInput.value
                        )
                        : 1.2;




                const goal =
                    goalInput
                        ? goalInput.value
                        : "maintain";




                if (
                    !age ||
                    !height ||
                    !weight
                ) {




                    alert(
                        "Lengkapi usia, tinggi, dan berat badan."
                    );




                    return;


                }




                let bmr;




                if (
                    selectedGender ===
                    "male"
                ) {




                    bmr =
                        (
                            10 *
                            weight
                        ) +
                        (
                            6.25 *
                            height
                        ) -
                        (
                            5 *
                            age
                        ) +
                        5;


                }


                else {




                    bmr =
                        (
                            10 *
                            weight
                        ) +
                        (
                            6.25 *
                            height
                        ) -
                        (
                            5 *
                            age
                        ) -
                        161;


                }




                const tdee =
                    bmr *
                    activity;




                let target;




                if (
                    goal ===
                    "loss"
                ) {




                    target =
                        tdee -
                        300;


                }


                else if (
                    goal ===
                    "gain"
                ) {




                    target =
                        tdee +
                        250;


                }


                else {




                    target =
                        tdee;


                }




                const roundedBmr =
                    Math.round(
                        bmr
                    );




                const roundedTdee =
                    Math.round(
                        tdee
                    );




                const roundedTarget =
                    Math.round(
                        target
                    );




                if (resultBmr) {




                    resultBmr.textContent =
                        formatNumber(
                            roundedBmr
                        );


                }




                if (resultTdee) {




                    resultTdee.textContent =
                        formatNumber(
                            roundedTdee
                        );


                }




                if (resultTarget) {




                    resultTarget.textContent =
                        formatNumber(
                            roundedTarget
                        );


                }




                localStorage.setItem(
                    "mph_calorie_target",
                    roundedTarget
                );




                const total =
                    todayFoodLogs.reduce(
                        function (
                            sum,
                            food
                        ) {




                            return (
                                sum +
                                Number(
                                    food.calories
                                )
                            );


                        },
                        0
                    );




                updateDailyRemaining(
                    total
                );




                if (
                    resultMessage
                ) {




                    if (
                        goal ===
                        "loss"
                    ) {




                        resultMessage.textContent =
                            "Target menggunakan defisit moderat sekitar 300 kcal dari kebutuhan maintenance.";


                    }


                    else if (
                        goal ===
                        "gain"
                    ) {




                        resultMessage.textContent =
                            "Target menggunakan surplus moderat sekitar 250 kcal dari kebutuhan maintenance.";


                    }


                    else {




                        resultMessage.textContent =
                            "Target maintenance disamakan dengan estimasi kebutuhan kalori harianmu.";


                    }


                }


            }
        );


    }






    // ==========================================
    // LOAD SAVED CALORIE TARGET
    // ==========================================




    function loadSavedCalorieTarget() {




        const savedTarget =
            localStorage.getItem(
                "mph_calorie_target"
            );




        if (!savedTarget) {




            if (dailyTarget) {




                dailyTarget.textContent =
                    "—";


            }




            if (dailyRemaining) {




                dailyRemaining.textContent =
                    "—";


            }




            return;


        }




        if (dailyTarget) {




            dailyTarget.textContent =
                formatNumber(
                    Number(
                        savedTarget
                    )
                );


        }




        const total =
            todayFoodLogs.reduce(
                function (
                    sum,
                    food
                ) {




                    return (
                        sum +
                        Number(
                            food.calories
                        )
                    );


                },
                0
            );




        updateDailyRemaining(
            total
        );


    }






    loadSavedCalorieTarget();






    // ==========================================
    // BB TRACKER
    // ==========================================




    let weightLogs =
        [];




    const todayWeight =
        document.getElementById(
            "todayWeight"
        );




    const saveWeightButton =
        document.getElementById(
            "saveWeightButton"
        );




    const latestWeight =
        document.getElementById(
            "latestWeight"
        );




    const weightChange =
        document.getElementById(
            "weightChange"
        );




    const lowestWeight =
        document.getElementById(
            "lowestWeight"
        );




    const highestWeight =
        document.getElementById(
            "highestWeight"
        );




    const weightHistory =
        document.getElementById(
            "weightHistory"
        );


    const downloadWeightDataButton =
        document.getElementById(
            "downloadWeightData"
        );




    const weightChart =
        document.getElementById(
            "weightChart"
        );




    const weightChartEmpty =
        document.getElementById(
            "weightChartEmpty"
        );




    const weightChartLine =
        document.getElementById(
            "weightChartLine"
        );




    const weightChartDots =
        document.getElementById(
            "weightChartDots"
        );




    const weightGrid =
        document.getElementById(
            "weightGrid"
        );


    const weightChartPeriodControls =
        document.getElementById(
            "weightChartPeriodControls"
        );


    let selectedWeightChartDays =
        7;






    // ==========================================
    // WEIGHT CHART PERIODS
    // ==========================================


    function setupWeightChartPeriods() {


        if (!weightChartPeriodControls) {
            return;
        }


        const buttons =
            weightChartPeriodControls.querySelectorAll(
                ".weight-period-btn"
            );


        buttons.forEach(function(button) {


            button.addEventListener(
                "click",
                function() {


                    selectedWeightChartDays =
                        Number(
                            button.dataset.period
                        ) || 7;


                    buttons.forEach(
                        function(item) {
                            item.classList.toggle(
                                "active",
                                item === button
                            );
                        }
                    );


                    renderWeightChart();


                }
            );


        });


    }


    // ==========================================
    // SIX MONTHS AGO
    // ==========================================




    function getSixMonthsAgo() {




        const date =
            new Date();




        date.setMonth(
            date.getMonth() - 6
        );




        const year =
            date.getFullYear();




        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );




        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );




        return (
            year +
            "-" +
            month +
            "-" +
            day
        );


    }






    setupWeightChartPeriods();


    // ==========================================
    // CURRENT USER
    // ==========================================




    async function getCurrentUser() {




        const {
            data,
            error
        } =
            await window.mphSupabase
                .auth
                .getUser();




        if (error) {




            console.error(
                "MPH: Gagal mengambil user.",
                error
            );




            return null;


        }




        return data.user;


    }






    // ==========================================
    // LOAD WEIGHT LOGS
    // ==========================================




    async function loadWeightLogs() {




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            data,
            error
        } =
            await window.mphSupabase
                .from(
                    "weight_logs"
                )
                .select(
                    "id, user_id, weight, logged_at, created_at"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .gte(
                    "logged_at",
                    getSixMonthsAgo()
                )
                .order(
                    "logged_at",
                    {
                        ascending:
                            false
                    }
                );




        if (error) {




            console.error(
                "MPH: Gagal mengambil weight logs.",
                error
            );




            return;


        }




        weightLogs =
            data ||
            [];




        renderWeightStats();




        renderWeightHistory();




        renderWeightChart();




        updateTodayWeightInput();


    }






    // ==========================================
    // TODAY WEIGHT INPUT
    // ==========================================




    function updateTodayWeightInput() {




        if (!todayWeight) {


            return;


        }




        const today =
            getTodayDate();




        const todayLog =
            weightLogs.find(
                function (
                    item
                ) {




                    return (
                        item.logged_at ===
                        today
                    );


                }
            );




        if (todayLog) {




            todayWeight.value =
                Number(
                    todayLog.weight
                ).toFixed(
                    1
                );




            if (saveWeightButton) {




                saveWeightButton.textContent =
                    "Perbarui Berat Badan";


            }


        }


        else {




            todayWeight.value =
                "";




            if (saveWeightButton) {




                saveWeightButton.textContent =
                    "Simpan Berat Badan";


            }


        }


    }






    // ==========================================
    // WEIGHT STATS
    // ==========================================




    function renderWeightStats() {




        if (
            weightLogs.length ===
            0
        ) {




            if (latestWeight) {




                latestWeight.textContent =
                    "—";


            }




            if (weightChange) {




                weightChange.textContent =
                    "—";




                weightChange.className =
                    "weight-stat-value change-neutral";


            }




            if (lowestWeight) {




                lowestWeight.textContent =
                    "—";


            }




            if (highestWeight) {




                highestWeight.textContent =
                    "—";


            }




            return;


        }




        const latest =
            weightLogs[0];




        const sortedAscending =
            [
                ...weightLogs
            ].sort(
                function (
                    a,
                    b
                ) {




                    return (
                        Number(
                            a.weight
                        ) -
                        Number(
                            b.weight
                        )
                    );


                }
            );




        const lowest =
            sortedAscending[0];




        const highest =
            sortedAscending[
                sortedAscending.length -
                1
            ];




        if (latestWeight) {




            latestWeight.textContent =
                formatNumber(
                    latest.weight
                );


        }




        if (lowestWeight) {




            lowestWeight.textContent =
                formatNumber(
                    lowest.weight
                );


        }




        if (highestWeight) {




            highestWeight.textContent =
                formatNumber(
                    highest.weight
                );


        }




        if (
            weightLogs.length <
            2
        ) {




            if (weightChange) {




                weightChange.textContent =
                    "—";




                weightChange.className =
                    "weight-stat-value change-neutral";


            }




            return;


        }




        const previous =
            weightLogs[1];




        const change =
            Number(
                latest.weight
            ) -
            Number(
                previous.weight
            );




        if (!weightChange) {


            return;


        }




        if (
            change > 0
        ) {




            weightChange.textContent =
                "+" +
                formatNumber(
                    change
                ) +
                " kg";




            weightChange.className =
                "weight-stat-value change-positive";


        }


        else if (
            change < 0
        ) {




            weightChange.textContent =
                formatNumber(
                    change
                ) +
                " kg";




            weightChange.className =
                "weight-stat-value change-negative";


        }


        else {




            weightChange.textContent =
                "0 kg";




            weightChange.className =
                "weight-stat-value change-neutral";


        }


    }






    // ==========================================
    // SAVE / UPDATE WEIGHT
    // ==========================================




    if (saveWeightButton) {




        saveWeightButton.addEventListener(
            "click",
            async function () {




                const value =
                    todayWeight
                        ? Number(
                            todayWeight.value
                        )
                        : 0;




                if (
                    !value ||
                    value < 20 ||
                    value > 300
                ) {




                    alert(
                        "Masukkan berat badan antara 20–300 kg."
                    );




                    return;


                }




                const user =
                    await getCurrentUser();




                if (!user) {




                    alert(
                        "Session login tidak ditemukan."
                    );




                    return;


                }




                saveWeightButton.disabled =
                    true;




                saveWeightButton.textContent =
                    "Menyimpan...";




                const today =
                    getTodayDate();




                const {
                    data:
                        existingData,


                    error:
                        existingError
                } =
                    await window.mphSupabase
                        .from(
                            "weight_logs"
                        )
                        .select(
                            "id"
                        )
                        .eq(
                            "user_id",
                            user.id
                        )
                        .eq(
                            "logged_at",
                            today
                        )
                        .maybeSingle();




                if (existingError) {




                    console.error(
                        "MPH: Gagal mengecek BB hari ini.",
                        existingError
                    );




                    saveWeightButton.disabled =
                        false;




                    saveWeightButton.textContent =
                        "Simpan Berat Badan";




                    alert(
                        "Data BB gagal dicek."
                    );




                    return;


                }




                let saveError =
                    null;




                if (existingData) {




                    const {
                        error
                    } =
                        await window.mphSupabase
                            .from(
                                "weight_logs"
                            )
                            .update({


                                weight:
                                    value


                            })
                            .eq(
                                "id",
                                existingData.id
                            )
                            .eq(
                                "user_id",
                                user.id
                            );




                    saveError =
                        error;


                }


                else {




                    const {
                        error
                    } =
                        await window.mphSupabase
                            .from(
                                "weight_logs"
                            )
                            .insert({


                                user_id:
                                    user.id,


                                weight:
                                    value,


                                logged_at:
                                    today


                            });




                    saveError =
                        error;


                }




                if (saveError) {




                    console.error(
                        "MPH: Gagal menyimpan BB.",
                        saveError
                    );




                    saveWeightButton.disabled =
                        false;




                    saveWeightButton.textContent =
                        "Simpan Berat Badan";




                    alert(
                        "Berat badan gagal disimpan."
                    );




                    return;


                }




                console.log(
                    "MPH: BB berhasil disimpan:",
                    value,
                    today
                );




                saveWeightButton.disabled =
                    false;




                saveWeightButton.textContent =
                    "Tersimpan ✓";




                await loadWeightLogs();




                await loadHomeWeight();




                setTimeout(
                    function () {




                        updateTodayWeightInput();


                    },
                    1000
                );


            }
        );


    }






    // ==========================================
    // WEIGHT HISTORY
    // ==========================================




    function formatDate(
        dateString
    ) {




        const date =
            new Date(
                dateString +
                "T00:00:00"
            );




        return date.toLocaleDateString(
            "id-ID",
            {
                day:
                    "numeric",


                month:
                    "short",


                year:
                    "numeric"
            }
        );


    }






    function getRelativeDate(
        dateString
    ) {




        const today =
            getTodayDate();




        if (
            dateString ===
            today
        ) {




            return "Hari ini";


        }




        const date =
            new Date(
                dateString +
                "T00:00:00"
            );




        const now =
            new Date(
                today +
                "T00:00:00"
            );




        const diff =
            Math.round(
                (
                    now -
                    date
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );




        if (
            diff ===
            1
        ) {




            return "Kemarin";


        }




        return (
            diff +
            " hari lalu"
        );


    }






    function renderWeightHistory() {




        if (!weightHistory) {


            return;


        }




        weightHistory.innerHTML =
            "";




        if (
            weightLogs.length ===
            0
        ) {




            weightHistory.innerHTML = `


                <div class="empty-food">


                    Belum ada catatan berat badan.


                </div>


            `;




            return;


        }




        weightLogs.forEach(
            function (
                log,
                index
            ) {




                const row =
                    document.createElement(
                        "div"
                    );




                row.className =
                    "history-row";




                let changeText =
                    "—";




                let changeClass =
                    "change-neutral";




                if (
                    index <
                    weightLogs.length -
                    1
                ) {




                    const previous =
                        Number(
                            weightLogs[
                                index + 1
                            ].weight
                        );




                    const change =
                        Number(
                            log.weight
                        ) -
                        previous;




                    if (
                        change > 0
                    ) {




                        changeText =
                            "+" +
                            formatNumber(
                                change
                            ) +
                            " kg";




                        changeClass =
                            "change-positive";


                    }


                    else if (
                        change < 0
                    ) {




                        changeText =
                            formatNumber(
                                change
                            ) +
                            " kg";




                        changeClass =
                            "change-negative";


                    }


                    else {




                        changeText =
                            "0 kg";


                    }


                }




                row.innerHTML = `


                    <div
                        class="history-date"
                    >


                        <strong>
                            ${formatDate(
                                log.logged_at
                            )}
                        </strong>


                        <span>
                            ${getRelativeDate(
                                log.logged_at
                            )}
                        </span>


                    </div>




                    <div
                        class="history-change ${changeClass}"
                    >
                        ${changeText}
                    </div>




                    <div
                        class="history-weight"
                    >


                        ${formatNumber(
                            log.weight
                        )}


                        <small>
                            kg
                        </small>


                    </div>




                    <button
                        class="delete-weight"
                        type="button"
                    >
                        ×
                    </button>


                `;




                row.querySelector(
                    ".delete-weight"
                ).addEventListener(
                    "click",
                    async function () {




                        await deleteWeight(
                            log.id
                        );


                    }
                );




                weightHistory.appendChild(
                    row
                );


            }
        );


    }






    // ==========================================
    // DOWNLOAD WEIGHT DATA
    // ==========================================

    function downloadWeightData() {

        if (!downloadWeightDataButton) {
            return;
        }

        if (!weightLogs || weightLogs.length === 0) {
            alert(
                "Belum ada data berat badan dalam 6 bulan terakhir."
            );
            return;
        }

        const rows = [
            ["Tanggal", "Berat (kg)"]
        ];

        const exportLogs =
            [...weightLogs].sort(function(a, b) {
                return (
                    new Date(b.logged_at) -
                    new Date(a.logged_at)
                );
            });

        exportLogs.forEach(function(log) {

            const dateParts =
                String(log.logged_at || "").split("-");

            const exportDate =
                dateParts.length === 3
                    ? dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0]
                    : log.logged_at;

            rows.push([
                exportDate,
                Number(log.weight)
            ]);

        });

        const csv =
            rows
                .map(function(row) {

                    return row
                        .map(function(value) {

                            const text =
                                String(
                                    value === null ||
                                    value === undefined
                                        ? ""
                                        : value
                                );

                            return '"' +
                                text.replace(
                                    /"/g,
                                    '""'
                                ) +
                                '"';

                        })
                        .join(",");

                })
                .join("\r\n");

        const csvWithBom =
            "\uFEFF" +
            csv;

        const blob =
            new Blob(
                [csvWithBom],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            "MPH-BB-Tracker-6-Bulan.csv";

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(
            url
        );

    }


    if (downloadWeightDataButton) {

        downloadWeightDataButton.addEventListener(
            "click",
            downloadWeightData
        );

    }


    // ==========================================
    // DELETE WEIGHT
    // ==========================================




    async function deleteWeight(
        id
    ) {




        const confirmed =
            confirm(
                "Hapus catatan berat badan ini?"
            );




        if (!confirmed) {


            return;


        }




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            error
        } =
            await window.mphSupabase
                .from(
                    "weight_logs"
                )
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "user_id",
                    user.id
                );




        if (error) {




            console.error(
                "MPH: Gagal menghapus BB.",
                error
            );




            alert(
                "Catatan gagal dihapus."
            );




            return;


        }




        await loadWeightLogs();




        await loadHomeWeight();


    }






    // ==========================================
    // WEIGHT CHART
    // ==========================================




    function renderWeightChart() {


        if (!weightChart) {
            return;
        }


        const today =
            getTodayDate();


        const cutoff =
            new Date(
                today +
                "T00:00:00"
            );


        cutoff.setDate(
            cutoff.getDate() -
            (selectedWeightChartDays - 1)
        );


        const cutoffString =
            cutoff.getFullYear() +
            "-" +
            String(
                cutoff.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                cutoff.getDate()
            ).padStart(2, "0");


        const chartData =
            weightLogs
                .filter(function(item) {
                    return (
                        item.logged_at >=
                        cutoffString &&
                        item.logged_at <=
                        today
                    );
                })
                .sort(function(a, b) {
                    return (
                        new Date(
                            a.logged_at
                        ) -
                        new Date(
                            b.logged_at
                        )
                    );
                });


        if (chartData.length < 2) {
            weightChart.style.display =
                "none";


            if (weightChartEmpty) {
                weightChartEmpty.style.display =
                    "flex";
                weightChartEmpty.textContent =
                    "Belum ada cukup data pada periode ini untuk menampilkan grafik.";
            }


            return;
        }


        weightChart.style.display =
            "block";


        if (weightChartEmpty) {
            weightChartEmpty.style.display =
                "none";
        }


        const width = 700;
        const height = 240;
        const paddingX = 25;
        const paddingY = 25;


        const values =
            chartData.map(function(item) {
                return Number(item.weight);
            });


        const minValue =
            Math.min(...values);
        const maxValue =
            Math.max(...values);
        const range =
            maxValue - minValue || 1;


        const points =
            chartData.map(function(item, index) {


                const x =
                    paddingX +
                    (
                        index /
                        Math.max(
                            chartData.length - 1,
                            1
                        )
                    ) *
                    (
                        width -
                        paddingX * 2
                    );


                const y =
                    height -
                    paddingY -
                    (
                        (
                            Number(item.weight) -
                            minValue
                        ) /
                        range
                    ) *
                    (
                        height -
                        paddingY * 2
                    );


                return {
                    x: x,
                    y: y,
                    value: Number(item.weight)
                };


            });


        if (weightChartLine) {
            weightChartLine.setAttribute(
                "points",
                points
                    .map(function(point) {
                        return (
                            point.x +
                            "," +
                            point.y
                        );
                    })
                    .join(" ")
            );
        }


        if (weightChartDots) {
            weightChartDots.innerHTML = "";


            points.forEach(function(point) {
                const circle =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "circle"
                    );


                circle.setAttribute(
                    "cx",
                    point.x
                );
                circle.setAttribute(
                    "cy",
                    point.y
                );
                circle.setAttribute(
                    "r",
                    "5"
                );
                circle.setAttribute(
                    "fill",
                    "#679343"
                );


                weightChartDots.appendChild(
                    circle
                );
            });
        }


        if (weightGrid) {
            weightGrid.innerHTML = "";


            const gridCount = 4;


            for (
                let i = 0;
                i <= gridCount;
                i++
            ) {
                const y =
                    paddingY +
                    (i / gridCount) *
                    (
                        height -
                        paddingY * 2
                    );


                const line =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "line"
                    );


                line.setAttribute(
                    "x1",
                    paddingX
                );
                line.setAttribute(
                    "x2",
                    width - paddingX
                );
                line.setAttribute(
                    "y1",
                    y
                );
                line.setAttribute(
                    "y2",
                    y
                );
                line.setAttribute(
                    "stroke",
                    "#e7e4dc"
                );
                line.setAttribute(
                    "stroke-width",
                    "1"
                );


                weightGrid.appendChild(line);
            }
        }


    }


    // ==========================================
    // HOME WEIGHT
    // ==========================================




    async function loadHomeWeight() {




        const user =
            await getCurrentUser();




        if (!user) {


            return;


        }




        const {
            data,
            error
        } =
            await window.mphSupabase
                .from(
                    "weight_logs"
                )
                .select(
                    "weight, logged_at"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "logged_at",
                    {
                        ascending:
                            false
                    }
                )
                .limit(
                    7
                );




        if (error) {




            console.error(
                "MPH: Gagal mengambil Home BB.",
                error
            );




            return;


        }




        const homeLatestWeight =
            document.getElementById(
                "homeLatestWeight"
            );




        const homeLatestWeightNote =
            document.getElementById(
                "homeLatestWeightNote"
            );




        if (
            !data ||
            data.length ===
            0
        ) {




            if (
                homeLatestWeight
            ) {




                homeLatestWeight.innerHTML =
                    "— <small>kg</small>";


            }




            if (
                homeLatestWeightNote
            ) {




                homeLatestWeightNote.textContent =
                    "Belum ada catatan berat badan";


            }




            return;


        }




        const latest =
            data[0];




        if (
            homeLatestWeight
        ) {




            homeLatestWeight.innerHTML =
                formatNumber(
                    latest.weight
                ) +
                " <small>kg</small>";


        }




        if (
            homeLatestWeightNote
        ) {




            if (
                data.length >
                1
            ) {




                const previous =
                    Number(
                        data[1].weight
                    );




                const change =
                    Number(
                        latest.weight
                    ) -
                    previous;




                if (
                    change < 0
                ) {




                    homeLatestWeightNote.textContent =
                        "Turun " +
                        formatNumber(
                            Math.abs(
                                change
                            )
                        ) +
                        " kg dari catatan sebelumnya";


                }


                else if (
                    change > 0
                ) {




                    homeLatestWeightNote.textContent =
                        "Naik " +
                        formatNumber(
                            change
                        ) +
                        " kg dari catatan sebelumnya";


                }


                else {




                    homeLatestWeightNote.textContent =
                        "Sama dengan catatan sebelumnya";


                }


            }


            else {




                homeLatestWeightNote.textContent =
                    "Catatan terbaru";


            }


        }




        const miniChart =
            document.getElementById(
                "homeWeightMiniChart"
            );




        if (
            miniChart &&
            data.length >= 2
        ) {




            const values =
                [
                    ...data
                ]
                .reverse()
                .map(
                    function (
                        item
                    ) {




                        return Number(
                            item.weight
                        );


                    }
                );




            const min =
                Math.min(
                    ...values
                );




            const max =
                Math.max(
                    ...values
                );




            const range =
                max -
                min ||
                1;




            const points =
                values.map(
                    function (
                        value,
                        index
                    ) {




                        const x =
                            5 +
                            (
                                index /
                                Math.max(
                                    values.length -
                                    1,
                                    1
                                )
                            ) *
                            170;




                        const y =
                            55 -
                            (
                                (
                                    value -
                                    min
                                ) /
                                range
                            ) *
                            40;




                        return (
                            x +
                            "," +
                            y
                        );


                    }
                );




            const polyline =
                miniChart.querySelector(
                    "polyline"
                );




            if (polyline) {




                polyline.setAttribute(
                    "points",
                    points.join(
                        " "
                    )
                );


            }


        }


    }






    // ==========================================
    // ESCAPE HTML
    // ==========================================




    function escapeHtml(
        value
    ) {




        return String(
            value
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );


    }






    // ==========================================
    // STORAGE TEST
    // ==========================================




    const {
        data:
            storageData,


        error:
            storageError
    } =
        await window.mphSupabase
            .storage
            .from(
                STORAGE_BUCKET
            )
            .list(
                "",
                {
                    limit:
                        20
                }
            );




    if (storageError) {




        console.error(
            "MPH: Storage gagal diakses.",
            storageError
        );


    }


    else {




        console.log(
            "MPH: Supabase Storage berhasil diakses.",
            storageData
        );


    }






    // ==========================================
    // FINAL LOG
    // ==========================================




    mphAppReady = true;

    if (mphPendingSession) {
        await restoreLastScreen(
            mphPendingSession
        );
    }


    console.log(
        "MPH: app.js selesai dimuat."
    );




};




supabaseScript.onerror =
    function () {




        console.error(
            "MPH: Gagal memuat Supabase."
        );


    };




document.head.appendChild(
    supabaseScript
);