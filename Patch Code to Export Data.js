async function exportDataverseTable(entityLogicalName, columns) {
    try {
        // Step 1: Fetch data from Dataverse
        const query = `?$select=${columns.join(",")}&$top=5000`; // Adjust $top as needed
        const result = await Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, query);

        // Step 2: Format the data for CSV
        let csvContent = columns.join(",") + "\n"; // Add headers

        result.entities.forEach(record => {
            let row = [];
            columns.forEach(column => {
                // Handle null or undefined values
                let value = record[column] ?? "";
                
                // Include lookup or choice formatted values if available
                if (record[`${column}@OData.Community.Display.V1.FormattedValue`]) {
                    value = record[`${column}@OData.Community.Display.V1.FormattedValue`];
                }
                row.push(`"${value}"`); // Escape values in double quotes
            });
            csvContent += row.join(",") + "\n";
        });

        // Step 3: Create a downloadable CSV file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `${entityLogicalName}_Export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("Export completed successfully.");
    } catch (error) {
        console.error("Error exporting table:", error.message);
    }
}

// Example Usage
const entityLogicalName = "account"; // Replace with your table's logical name
const columns = ["name", "primarycontactid", "statuscode"]; // Replace with your columns
exportDataverseTable(entityLogicalName, columns);

async function fetchAllRecords(entityLogicalName, query) {
    let allRecords = [];
    let nextLink = null;

    do {
        const result = await Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, query + (nextLink ? `&${nextLink}` : ""));
        allRecords = allRecords.concat(result.entities);
        nextLink = result["@odata.nextLink"];
    } while (nextLink);

    return allRecords;
}
