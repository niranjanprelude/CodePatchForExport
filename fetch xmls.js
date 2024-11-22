<fetch mapping="logical">
  <entity name="your_table_name">
    <all-attributes />
  </entity>
</fetch>

<fetch mapping="logical" count="400">
  <entity name="your_table_name">
    <attribute name="column1" />
    <attribute name="column2" />
    <attribute name="column3" />
    <!-- Add other columns as needed -->
  </entity>
</fetch>
