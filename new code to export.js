async function exportDataverseDataToCSV(fetchXml, entityLogicalName) {
    const MAX_PAGE_SIZE = 5000; // Dataverse API page size limit
    let allRecords = [];
    let pagingCookie = null;
    let fetchXmlWithPaging = fetchXml;

    do {
        // Add paging attributes if pagingCookie is present
        if (pagingCookie) {
            fetchXmlWithPaging = fetchXml.replace(
                '</fetch>',
                `<fetchxmlpagingcookie="${pagingCookie}" pagingcookie="${pagingCookie}" page="2" count="${MAX_PAGE_SIZE}"></fetch>`
            );
        }

        const result = await Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, "?fetchXml=" + encodeURIComponent(fetchXmlWithPaging));

        // Add the current set of records to the allRecords array
        allRecords = allRecords.concat(result.entities);

        // Get the paging cookie from the response
        pagingCookie = result["@Microsoft.Dynamics.CRM.fetchxmlpagingcookie"] || null;
    } while (pagingCookie);

    if (allRecords.length === 0) {
        alert("No records found.");
        return;
    }

    // Format records as CSV
    const csvFiles = formatDataToCSV(allRecords);

    // Trigger download of CSV files
    csvFiles.forEach((csv, index) => {
        downloadCSV(csv, `dataverse_export_part_${index + 1}.csv`);
    });

    alert("Export completed!");
}

function formatDataToCSV(records) {
    const CHUNK_SIZE = 5000; // Split into smaller files if the number of records is too large
    const headers = Object.keys(records[0]);
    const chunks = [];

    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        const rows = chunk.map(record => {
            return headers.map(header => `"${record[header] || ""}"`).join(",");
        });
        const csvContent = [headers.join(","), ...rows].join("\n");
        chunks.push(csvContent);
    }

    return chunks;
}

function downloadCSV(csvContent, fileName) {
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Example FetchXML to fetch all attributes of "contacts"
const fetchXml = `
<fetch mapping="logical">
  <entity name="contact">
    <all-attributes />
  </entity>
</fetch>
`;

// Call the function to export data (replace "contacts" with the logical name of your table)
exportDataverseDataToCSV(fetchXml, "contacts");
