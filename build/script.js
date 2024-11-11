let idCards = [];
let schoolName, schoolInfo, schoolContact, schoolLogoURL, pictureFiles;

// Show the form to enter school details
function showForm() {
    document.getElementById('formContainer').style.display = 'block';
}

// Trigger the file input for uploading the Excel file
function uploadFile() {
    document.getElementById('fileInput').click();
}

// Handle file selection and read the Excel content
function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Save Excel data for generating IDs after entering school info
        window.excelData = jsonData.slice(1);  // Skip header row
        showForm();
    };

    reader.readAsArrayBuffer(file);
}

// Process the form inputs and start ID generation
function startGeneratingIDs() {
    schoolName = document.getElementById('schoolName').value;
    schoolInfo = document.getElementById('schoolInfo').value;
    schoolContact = document.getElementById('schoolContact').value;

    const logoInput = document.getElementById('schoolLogo').files[0];
    pictureFiles = document.getElementById('pictureFolder').files;

    if (logoInput && pictureFiles.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
            schoolLogoURL = e.target.result;
            generateIDsFromExcelData();
        };
        reader.readAsDataURL(logoInput);
    } else {
        alert("Please upload both a school logo and a picture folder.");
    }
}

// Generate ID cards for each student based on Excel data
function generateIDsFromExcelData() {
    window.excelData.forEach((row) => {
        const [studentName, className, regNumber, sex, guardianTel, academicYear] = row;

        // Find matching picture file based on student name
        const pictureFile = Array.from(pictureFiles).find(file => file.name.includes(studentName));
        let pictureURL = "";

        if (pictureFile) {
            const pictureReader = new FileReader();
            pictureReader.onload = (e) => {
                pictureURL = e.target.result;
                generateIDFromExcel(studentName, className, regNumber, sex, guardianTel, academicYear, pictureURL);
            };
            pictureReader.readAsDataURL(pictureFile);
        } else {
            // Generate ID without picture if no matching image is found
            generateIDFromExcel(studentName, className, regNumber, sex, guardianTel, academicYear, "");
        }

        // Send student data to Firebase Realtime Database
        const studentData = {
            name: studentName,
            class: className,
            regNumber: regNumber,
            sex: sex,
            guardianTel: guardianTel,
            academicYear: academicYear
        };
        
        // POST data to Firebase
        fetch('https://idmachine-default-rtdb.firebaseio.com/students.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        })
        .then(response => {
            if (response.ok) {
                console.log(`Student ${studentName} added to Firebase.`);
            } else {
                console.error(`Failed to add ${studentName} to Firebase.`);
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

// Generate a single ID card from Excel row data
function generateIDFromExcel(studentName, className, regNumber, sex, guardianTel, academicYear, pictureURL) {
    const idCardHTML = `
        <div class="id-card">
            <div class="header">
                <div>${schoolName}</div>
                <div style="font-size:14px">${schoolInfo}</div>
                <div>${schoolContact}</div>
                <img src="${schoolLogoURL}" alt="School Logo">
            </div>
            <div class="content">
                <div class="info">
                    <div><strong>Name of Student:</strong> ${studentName}</div>
                    <div><strong>Class:</strong> ${className}</div>
                    <div><strong>Reg. Number:</strong> ${regNumber}</div>
                    <div><strong>Sex:</strong> ${sex}</div>
                    <div><strong>Guardian Tel:</strong> ${guardianTel}</div>
                    <div><strong>Academic Year:</strong> ${academicYear}</div>
                </div>
                <img src="${pictureURL || 'default-profile.png'}" alt="Student Picture">
            </div>
        </div>
    `;

    idCards.push(idCardHTML);
    renderIDCards();

    if (idCards.length > 0) {
        document.getElementById('printButton').disabled = false;
    }
}

// Render ID cards in the container
function renderIDCards() {
    document.getElementById('idCardsContainer').innerHTML = idCards.join('');
}

// Print all ID cards as a PDF
function printPDF() {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print IDs</title>');
    printWindow.document.write('<link rel="stylesheet" type="text/css" href="styles.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="id-cards-container">' + idCards.join('') + '</div>');
    printWindow.document.close();
    printWindow.print();
}
