// ----------------------------------------------------------------------------
// Configuration and Default Theme
// ----------------------------------------------------------------------------

const DEFAULT_THEME = {
    themeName: "默认主题",
    // Use linear-gradient or url() for backgrounds. Ensure values are valid CSS.
    // For background-image, use values like "linear-gradient(...)" or "url('path/to/image.jpg')"
    backgroundColor: "linear-gradient(135deg, #f6d365, #fda085)",
    containerBackgroundColor: "rgba(255, 255, 255, 0.8)",
    displayAreaBackgroundColor: "linear-gradient(45deg, #e0e0e0, #f9f9f9)",
    displayAreaBorderColor: "rgba(100, 100, 100, 0.5)",
    nameDisplayColor: "#333333",
    // Increased default size to be larger, approximating H1.
    // This value will be used by applyTheme to set the CSS variable.
    nameDisplaySize: "5.5rem", // Changed from "5rem" to be larger by default
    startBtnBackground: "linear-gradient(135deg, #4CAF50, #8BC34A)",
    startBtnBorderColor: "rgba(139, 195, 74, 0.5)",
    stopBtnBackground: "linear-gradient(135deg, #FF5722, #FF9800)",
    stopBtnBorderColor: "rgba(255, 152, 0, 0.5)",
    studentCardBackground: "rgba(255, 255, 255, 0.9)",
    studentCardBorderColor: "rgba(200, 200, 200, 0.6)",
    studentCardSelectedBackground: "rgba(76, 175, 80, 0.8)",
    studentCardSelectedBorderColor: "rgba(76, 175, 80, 0.9)",
    footerBackgroundColor: "rgba(245, 245, 245, 0.7)"
};

// Global variable to store the currently applied theme object for easy access
let currentAppliedTheme = { ...DEFAULT_THEME };

// ----------------------------------------------------------------------------
// Theme Management Functions
// ----------------------------------------------------------------------------

/**
 * Applies the provided theme object to the page elements.
 * Uses CSS variables where possible.
 * @param {object} theme - The theme object to apply.
 */
function applyTheme(theme) {
    currentAppliedTheme = { ...theme }; // Update global theme tracker

    const root = document.documentElement; // Get <html> element for CSS variables

    // Apply styles using CSS variables and direct element styling
    // Body Background
    document.body.style.backgroundImage = theme.backgroundColor;
    document.body.style.backgroundSize = 'cover'; // Ensure it covers
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed'; // Crucial for fixed background effect
    // If theme.backgroundColor is not a gradient or url, set a fallback body background color
    if (!theme.backgroundColor.includes('url(') && !theme.backgroundColor.includes('gradient')) {
        document.body.style.backgroundColor = theme.backgroundColor;
    }

    // Container
    const container = document.querySelector('.container');
    if (container) {
        container.style.backgroundColor = theme.containerBackgroundColor;
        // Ensure container is transparent if body has a full-page background image
        if (theme.backgroundColor.includes('url(') || theme.backgroundColor.includes('gradient')) {
            container.style.backgroundColor = 'transparent';
        }
    }

    // Display Area
    const displayArea = document.getElementById('display-area');
    if (displayArea) {
        displayArea.style.background = theme.displayAreaBackgroundColor;
        displayArea.style.borderColor = theme.displayAreaBorderColor;
        displayArea.style.color = theme.nameDisplayColor;
        // Set font size via CSS variable for greater flexibility.
        // If theme.nameDisplaySize is empty or invalid, it will revert to 6vw.
        root.style.setProperty('--name-display-size', theme.nameDisplaySize || '6vw'); // Changed fallback to 6vw to match clamp's preferred unit
        root.style.setProperty('--name-display-color', theme.nameDisplayColor || '#333');
    }

    // Buttons (assuming 'startBtn' and 'stopBtn' are the actual IDs)
    const startButton = document.getElementById('startBtn');
    if (startButton) {
        startButton.style.background = theme.startBtnBackground;
        // A more dynamic shadow might use a primary border color or a darker shade of background
        startButton.style.boxShadow = `0 8px 25px rgba(0,0,0,0.4)`; // Default shadow for consistency
        // If you need dynamic border color shadow, you'd need to define it in theme.json
    }

    const stopButton = document.getElementById('stopBtn');
    if (stopButton) {
        stopButton.style.background = theme.stopBtnBackground;
        stopButton.style.boxShadow = `0 8px 25px rgba(0,0,0,0.4)`;
    }

    // Student Cards
    const studentCards = document.querySelectorAll('.student-card');
    studentCards.forEach(card => {
        card.style.background = theme.studentCardBackground;
        card.style.borderColor = theme.studentCardBorderColor;
        card.style.color = theme.nameDisplayColor || '#333'; // Default text color for cards
    });

    // Footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.backgroundColor = theme.footerBackgroundColor;
    }
}
// ... (rest of the Theme Management Functions remain the same) ...

// ----------------------------------------------------------------------------
// Student Roll Call Logic
// ----------------------------------------------------------------------------

// Ensure student list is valid
const students = [
    "孙雨欣", "韩馨雨", "杜艺嘉乐", "李致远", "董洁", "王嘉轩", "常艺凡", "杲奕然", "王雨涵", "王若涵",
    "徐瀚霖", "姚佳成", "兰文博", "乔士轩", "郭子茹", "郝梦薇", "孙斌凯", "张新烨", "徐竟源", "王子墨",
    "刘雪菲", "王烁奇", "靳晨瑞", "张嘉佑", "王雨晴", "陈发昊", "刘爱雯", "宋甲一", "王子童", "刘海萱",
    "李思瑶", "何仔语", "王运泽", "吴雨薇", "谢佳録", "耿浩天", "陈姚妡", "姜宇泽", "王怡惠", "武则润",
    "宋梓琪", "张思语", "王伟晔", "沈永恒", "郎丽荣", "闫伟泰", "孙贞羲", "刘雨晴", "吴欣烨", "李苛欣",
    "张清硕", "郭佳洲", "赵紫茹", "王逸轩", "姚雨婷"
];

const validStudents = students.filter(name => name && name.trim() !== ""); // Robust filter

let isRolling = false;
let rollInterval;
let currentIndex = -1; // Index of the currently displayed student
let baseSpeed = 50; // Initial speed of name cycling (lower is faster)
let speedDecelerationRate = 0.95; // How much speed reduces per step
let minSpeed = 30; // Minimum speed - Adjusted to a slightly higher value from 20 for better feel
let decelerationSteps = 0; // Counter to control deceleration stages

// DOM Elements - Ensure these IDs match your HTML file
const nameDisplayElement = document.getElementById('nameDisplay');
const startButtonElement = document.getElementById('startBtn');
const stopButtonElement = document.getElementById('stopBtn');
const studentListContainerElement = document.getElementById('studentList');
const themeSelectorElement = document.getElementById('theme-selector');

/**
 * Initializes the student list display.
 */
function initStudents() {
    if (!studentListContainerElement) {
        console.error("Student list container with ID 'studentList' not found.");
        return;
    }
    studentListContainerElement.innerHTML = ''; // Clear existing
    if (validStudents.length === 0) {
        studentListContainerElement.innerHTML = '<p style="color: #ccc; font-size: 1.2rem; margin-top: 20px;">暂无学生名单。</p>';
        return;
    }

    validStudents.forEach((name, index) => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.textContent = name;
        card.dataset.index = index; // Store index for easy selection
        studentListContainerElement.appendChild(card);
    });
}

/**
 * Updates the UI to reflect the selected student card being highlighted.
 * @param {number} studentIndex - The index of the student to highlight.
 */
function highlightStudentCard(studentIndex) {
    // Remove highlight from all cards
    document.querySelectorAll('.student-card').forEach(card => {
        card.classList.remove('selected');
        // Re-apply base styles from the current theme
        card.style.background = currentAppliedTheme.studentCardBackground;
        card.style.borderColor = currentAppliedTheme.studentCardBorderColor;
        card.style.color = currentAppliedTheme.nameDisplayColor || '#333';
    });

    // Highlight the actual student card
    if (studentIndex !== -1 && studentIndex < validStudents.length) {
        const selectedCardElement = document.querySelector(`.student-card[data-index='${studentIndex}']`);
        if (selectedCardElement) {
            selectedCardElement.classList.add('selected');
            selectedCardElement.style.background = currentAppliedTheme.studentCardSelectedBackground;
            selectedCardElement.style.borderColor = currentAppliedTheme.studentCardSelectedBorderColor;
            selectedCardElement.style.color = '#0a1128'; // For contrast on selected card

            // Smoothly scroll to the selected card
            selectedCardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
}

/**
 * Starts the name rolling animation.
 */
function startRoll() {
    if (isRolling || validStudents.length === 0) return;

    isRolling = true;
    if (startButtonElement) startButtonElement.disabled = true;
    if (stopButtonElement) stopButtonElement.disabled = false;
    if (nameDisplayElement) {
        nameDisplayElement.classList.remove('pulse');
        nameDisplayElement.classList.add('flash'); // Start flashing effect
        // Apply larger font size immediately when rolling starts
        nameDisplayElement.style.fontSize = currentAppliedTheme.nameDisplaySize || '5.5rem'; // Ensure large size when rolling
    }

    baseSpeed = 60; // Reset speed
    speedDecelerationRate = 0.95;
    minSpeed = 30; // Slightly higher min speed for better stopping feel
    decelerationSteps = 0;

    // Clear any existing interval to prevent multiple intervals running
    if (rollInterval) clearInterval(rollInterval);

    rollInterval = setInterval(() => {
        // Choose a random student
        currentIndex = Math.floor(Math.random() * validStudents.length);
        if (nameDisplayElement) {
            nameDisplayElement.textContent = validStudents[currentIndex];
        }
        highlightStudentCard(currentIndex); // Highlight the card as it cycles

        // Gradually slow down
        let currentSpeed = Math.max(minSpeed, baseSpeed * Math.pow(speedDecelerationRate, decelerationSteps));
        decelerationSteps++;

        if (currentSpeed <= minSpeed) {
            // Reached minimum speed, stop at the current name
            if (rollInterval) clearInterval(rollInterval);
            isRolling = false;
            if (startButtonElement) startButtonElement.disabled = false;
            if (stopButtonElement) stopButtonElement.disabled = true;
            if (nameDisplayElement) {
                nameDisplayElement.classList.remove('flash');
                nameDisplayElement.classList.add('pulse'); // Transition to pulse after stopping
            }
        } else {
            // Continue rolling at current speed
            if (rollInterval) clearInterval(rollInterval); // Clear and reset interval for smoother speed change
            rollInterval = setInterval(arguments.callee, currentSpeed); // Re-target current function
        }
    }, baseSpeed); // Initial speed
}


/**
 * Stops the name rolling animation.
 */
function stopRoll() {
    if (!isRolling) return;

    clearInterval(rollInterval); // Clear the interval immediately
    rollInterval = null; // Ensure it's nullified

    isRolling = false;
    if (startButtonElement) startButtonElement.disabled = false;
    if (stopButtonElement) stopButtonElement.disabled = true;
    if (nameDisplayElement) {
        nameDisplayElement.classList.remove('flash');
        nameDisplayElement.classList.add('pulse'); // Add pulse animation after stopping

        // Reset text and apply large font size for the "Randomly Selected" placeholder
        nameDisplayElement.textContent = "随机抽人"; // Reset display text
        // Ensure this text also has the large font size
        nameDisplayElement.style.cssText += "; font-size: " + (currentAppliedTheme.nameDisplaySize || '5.5rem') + ";"; // Use style.cssText to ensure it overrides potentially inline styles if any
    }

    // After a short delay, clean up highlighting and potentially reset state
    setTimeout(() => {
        if (nameDisplayElement) {
            nameDisplayElement.classList.remove('pulse');
            // The font size is already large from the line above, no need to reset it here unless you want a *different* size for idle state.
            // If you want it to revert to a smaller size when idle, you'd add that logic here. For now, it stays large.
        }
        highlightStudentCard(-1); // Remove all highlights
        currentIndex = -1; // Reset current index

        // Re-apply base card styles and ensure stop button is disabled
        document.querySelectorAll('.student-card').forEach(card => {
            card.classList.remove('selected');
            card.style.background = currentAppliedTheme.studentCardBackground;
            card.style.borderColor = currentAppliedTheme.studentCardBorderColor;
            card.style.color = currentAppliedTheme.nameDisplayColor || '#333';
        });
    }, 1500); // Delay to allow pulse animation to finish
}

// ----------------------------------------------------------------------------
// Event Listeners and Initialization
// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing students and loading themes.");
    initStudents();
    loadThemes(); // This will also call populateThemeSelector and apply the initial theme

    // Add event listener for the theme selector dropdown *after* it's populated
    // This listener should be here, not at the top, so it runs after DOM is ready
    if (themeSelectorElement) {
        themeSelectorElement.addEventListener('change', (event) => {
            try {
                const selectedTheme = JSON.parse(event.target.value);
                applyTheme(selectedTheme); // Apply the selected theme to entire page

                // After themes are applied, update roll call specific elements if needed
                // Especially important for the selected student card's styling if one is active
                highlightStudentCard(currentIndex); // Re-apply highlight with new theme colors

                // Ensure buttons are also styled correctly if their styles are theme-dependent
                if (isRolling) { // If rolling, buttons might need immediate update
                    const newTheme = JSON.parse(event.target.value); // Get the newly applied theme object again
                    if (startButtonElement) {
                        startButtonElement.style.background = newTheme.startBtnBackground;
                        startButtonElement.style.boxShadow = `0 8px 25px rgba(0,0,0,0.4)`;
                    }
                    if (stopButtonElement) {
                        stopButtonElement.style.background = newTheme.stopBtnBackground;
                        stopButtonElement.style.boxShadow = `0 8px 25px rgba(0,0,0,0.4)`;
                    }
                    // Also update the name display if it's currently showing a name
                    if (nameDisplayElement && currentIndex !== -1) {
                        nameDisplayElement.style.fontSize = newTheme.nameDisplaySize || '5.5rem';
                    }
                } else {
                    // If not rolling, reset the name display to "随机抽人" with large font size
                    if (nameDisplayElement) {
                        nameDisplayElement.textContent = "随机抽人";
                        nameDisplayElement.style.fontSize = selectedTheme.nameDisplaySize || '5.5rem';
                        nameDisplayElement.classList.remove('flash', 'pulse'); // Ensure clean state
                    }
                }

                console.log(`Theme changed to: ${selectedTheme.themeName}`);
            } catch (e) {
                console.error("Failed to parse selected theme:", e);
                applyTheme(DEFAULT_THEME); // Fallback to default theme if parsing fails
            }
        });
    } else {
        console.error("Theme selector element with ID 'theme-selector' not found. Theme selection will not work.");
    }

    // Attach listeners to your original buttons
    if (startButtonElement) {
        startButtonElement.addEventListener('click', startRoll);
    } else {
        console.error("Start button with ID 'startBtn' not found.");
    }

    if (stopButtonElement) {
        stopButtonElement.addEventListener('click', stopRoll);
    } else {
        console.error("Stop button with ID 'stopBtn' not found.");
    }
});
