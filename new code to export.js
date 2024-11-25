async function fetchLargeDataset(fetchXml, entityLogicalName, pageSize = 5000) {
    let allRecords = [];
    let pageNumber = 1;
    let pagingCookie = null;

    while (true) {
        // Modify FetchXML to include paging parameters
        let fetchXmlWithPaging = fetchXml.replace("</fetch>", `<fetch page="${pageNumber}" count="${pageSize}"${pagingCookie ? ` paging-cookie="${pagingCookie}"` : ""}></fetch>`);

        // Fetch data using Xrm.WebApi
        const result = await Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, `?fetchXml=${encodeURIComponent(fetchXmlWithPaging)}`);

        // Append fetched records to allRecords
        allRecords = allRecords.concat(result.entities);

        // Check if more pages are available
        pagingCookie = result["@Microsoft.Dynamics.CRM.fetchxmlpagingcookie"];
        if (!pagingCookie) break;

        pageNumber++;
    }

    return allRecords;
}

// Example FetchXML for "contacts" entity
const fetchXml = `
<fetch mapping="logical">
  <entity name="contact">
    <all-attributes />
  </entity>
</fetch>
`;

// Call the function to fetch records
fetchLargeDataset(fetchXml, "contacts")
    .then(records => {
        console.log("Total records fetched:", records.length);
        console.log(records);
    })
    .catch(error => {
        console.error("Error fetching records:", error);
    });
