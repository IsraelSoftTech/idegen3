let idCards = [];
let schoolName, schoolInfo, schoolContact, schoolLogoURL, schoolStampURL, pictureFiles;

function showForm() {
    document.getElementById('formContainer').style.display = 'block';
}

function uploadFile() {
    document.getElementById('fileInput').click();
}

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Assuming student data starts from row 1 (no header row)
        window.excelData = jsonData;
        showForm();
    };

    reader.readAsArrayBuffer(file);
}

function startGeneratingIDs() {
    schoolName = document.getElementById('schoolName').value;
    schoolInfo = document.getElementById('schoolInfo').value;
    schoolContact = document.getElementById('schoolContact').value;

    const logoInput = document.getElementById('schoolLogo').files[0];
    const stampInput = document.getElementById('schoolStamp').files[0];
    pictureFiles = document.getElementById('pictureFolder').files;

    if (logoInput && stampInput && pictureFiles.length > 0) {
        const logoReader = new FileReader();
        logoReader.onload = (e) => {
            schoolLogoURL = e.target.result;
            const stampReader = new FileReader();
            stampReader.onload = (e) => {
                schoolStampURL = e.target.result;
                generateIDsFromExcelData();
            };
            stampReader.readAsDataURL(stampInput);
        };
        logoReader.readAsDataURL(logoInput);
    } else {
        alert("Please upload both a school logo, a stamp, and a picture folder.");
    }
}

function generateIDsFromExcelData() {
    window.excelData.forEach((row) => {
        // Ensure we have all required fields before attempting to generate an ID
        if (row.length >= 6) {
            const [studentName, className, regNumber, sex, guardianTel, academicYear] = row;

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
                generateIDFromExcel(studentName, className, regNumber, sex, guardianTel, academicYear, "");
            }
        }
    });

    document.getElementById("printButton").disabled = false;
}

function generateIDFromExcel(studentName, className, regNumber, sex, guardianTel, academicYear, pictureURL) {
    const idCardContainer = document.createElement('div');
    idCardContainer.className = 'id-card';

    idCardContainer.innerHTML = `
        <div class="header">
            <div>${schoolName}</div>
            <div>${schoolInfo}</div>
            <div style="color:yellow;">${schoolContact}</div>
            <img src="${schoolLogoURL}" alt="School Logo">
        </div>
        <div class="content">
            <div class="info">
                <strong>Name: ${studentName}</strong><br>
                Class: ${className}<br>
                Reg No: ${regNumber}<br>
                Gender: ${sex}<br>
                Guardian Tel: ${guardianTel}<br>
                Academic Year: ${academicYear}
               
            </div>
            <img src="${pictureURL}" alt="Student Photo">
        </div>
        
        <img class="stamp" src="${schoolStampURL}" alt="School Stamp">
        
    `;

    document.getElementById('idCardsContainer').appendChild(idCardContainer);
    idCards.push(idCardContainer);
}

function printPDF() {
    window.print();
}
