// https://www.redips.net/javascript/adding-table-rows-and-columns/
const TABLE_ID_INSTRUCTOR   = 'assignments-instructor-table_wrapper';
const TABLE_ID_STUDENT      = 'assignments-student-table';

const instructor_table  = document.getElementById(TABLE_ID_INSTRUCTOR);
const student_table     = document.getElementById(TABLE_ID_STUDENT);
let table = student_table;

const months = {
    "jan": '01',
    "feb": '02',
    "mar": '03',
    "apr": '04',
    "may": '05',
    "jun": '06',
    "jul": '07',
    "aug": '08',
    "sep": '09',
    "oct": '10',
    "nov": '11',
    "dec": '12',
}

// add calendar column to assignment table to right of due date column
function add_calendar_col(table) {
    // skip if col was already added
    const NEW_CLASS_NAME = `gradescope-calendar-button`;
    if (document.querySelector(`.${NEW_CLASS_NAME}`)) {
        return;
    }

    let rows = table.rows;
    console.log("rows", rows);

    for (let i = 0; i < rows.length; ++i) {
        let th = document.createElement(`th`);
        th.classList.add(NEW_CLASS_NAME);
        th.innerText = ``;
        if (i == 0) {
            th.innerText = `Add to Calendar`;
        }
        rows[i].appendChild(th);
    }
}
add_calendar_col(table);

// https://stackoverflow.com/a/22497471
const convertTime12to24 = (time12h) => {
    const time = time12h.match(/(\d+):(\d+)(\w+)/);
    let [hours, minutes, modifier] = [time[1], time[2], time[3]];

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    hours = hours.toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

/**
 * Generate calendar button html for the add to calendar button library.
 * @param {string} startDate - Contains month day, and time assignment starts. Ex: "APR 27 AT 12:02AM"
 * @param {string} endDate - Contains month day, and time assignment ends. Ex: "APR 27 AT 12:02AM"
 * @param {string} courseName - Name of the course. Used in the calendar event title
 * @param {string} assignmentName - Name of the assignment. Used in the calendar event title.
 * @param {string} assignmentLink - Link to the assignment. Used as the calendar event location.
 * @param {boolean} useEndDateOnly - Controls if start date should be the same as end date.
 */
function createCalendarHTML(startDate, endDate, courseName, assignmentName, assignmentLink = "", useEndDateOnly = true) {
    endDate         = endDate.split(" ");
    startDate       = startDate.split(" ");
    let startMonth  = months[startDate[0].toLowerCase()];
    let endMonth    = months[endDate[0].toLowerCase()];
    let startDay    = startDate[1];
    let endDay      = endDate[1];
    let startYear   = new Date().getFullYear();
    let endYear     = new Date().getFullYear();
    if (startMonth > endMonth) endYear++;
    startTime       = convertTime12to24(startDate[3]);
    endTime         = convertTime12to24(endDate[3]);

    if (useEndDateOnly) {
        startDay    = endDay;
        startMonth  = endMonth;
        startYear   = endYear;
        startTime   = endTime;
    }

    let calHTML = `<div class="atcb atcb-custom-style" style="display:none;">
    {
        "name":"${assignmentName} | ${courseName}",
        "description":"",
        "label":"${assignmentName}",
        "size":"3",
        "background":false,
        "checkmark":false,
        "startDate":"${startMonth}-${startDay}-${startYear}",
        "endDate":"${endMonth}-${endDay}-${endYear}",
        "startTime":"${startTime}",
        "endTime":"${endTime}",
        "location":"${assignmentLink}",
        "options":[
            "Apple",
            "Google",
            "iCal",
            "Microsoft365",
            "Outlook.com",
            "Yahoo"
        ],
        "timeZone":"currentBrowser",
        "iCalFileName":"Reminder-Event"
    }
    </div>`
    return calHTML;
}

// Add calendar button to each row
for (let i = 0, row; row = table.rows[i]; i++) {
    // skip header row
    if (i == 0) {
        continue;
    }
    let assignmentName;
    let assignmentLink;
    let dates;
    for (let j = 0, col; col = row.cells[j]; j++) {
        if (j == 0) {
            // assignment column
            assignmentName = col.textContent;
            try {
                assignmentLink = col.querySelector("a").href;
            } catch (error) {
                assignmentLink = "";
            }
        }

        if (j == 2) {
            // due date column
            if (col.children.length > 0) {
                dates = col.querySelector(".progressBar--caption").innerText.split("\n");
            }
        }

        if (j == 3 && dates) {
            // calendar column
            let startDate = dates[0], endDate = dates[1];
            let courseName = document.querySelector(".courseHeader--title").innerText;
            col.innerHTML = createCalendarHTML(startDate, endDate, courseName, assignmentName, assignmentLink, true);
        }
    }
}
