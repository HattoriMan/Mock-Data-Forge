function copyOutput() {
  const output=document.getElementById("output");
  const text=output.textContent;

  if (!text) {
    alert("Nothing to copy!");
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      alert("Copied to clipboard!");
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard.");
    });
}

function addField() {
  const div=document.createElement("div");
  div.className="row mt-2 align-items-center";

  div.innerHTML=`
    <div class="col-3">
      <input class="form-control field-name" placeholder="Field name">
    </div>

    <div class="col-2">
      <select class="form-select field-type" onchange="updateConstraints(this)">
        <option value="string">string</option>
        <option value="integer">integer</option>
        <option value="float">float</option>
        <option value="boolean">boolean</option>
        <option value="name" selected>name</option>
        <option value="email">email</option>
        <option value="phone">phone</option>
        <option value="date">date</option>
        <option value="uuid">uuid</option>
        <option value="image_url">image_url</option>
        <option value="file_url">file_url</option>
        <option value="object">object</option>
        <option value="array">array</option>
      </select>
    </div>

    <div class="col-4 constraints"></div>

    <div class="col-1">
      <button class="btn btn-danger" onclick="this.closest('.row').remove()">✖</button>
    </div>
  `;

  document.getElementById("fields").appendChild(div);
}

function updateConstraints(select) {
  const row=select.closest(".row");
  const container=row.querySelector(".constraints");
  const type=select.value;

  container.innerHTML="";

  // Range
  if (type === "integer" || type === "float") {
    container.innerHTML=`
      <input type="number" class="form-control mb-1 min" placeholder="Min">
      <input type="number" class="form-control max" placeholder="Max">
    `;
  }

  // Regex & enum
  if (type === "string") {
    container.innerHTML=`
      <input class="form-control mb-1 regex" placeholder="Regex (optional, e.g. ^[a-z]{3,5}$)">
      <input class="form-control enum" placeholder="Enum (comma-separated values, e.g. a,b,c)">
    `;

    const regexInput=container.querySelector(".regex");
    const enumInput=container.querySelector(".enum");

    regexInput.addEventListener("input", () => {
      enumInput.disabled=regexInput.value.trim().length > 0;
    });

    enumInput.addEventListener("input", () => {
      regexInput.disabled=enumInput.value.trim().length > 0;
    });
  }

  // Object
  if (type === "object") {
    container.innerHTML=`
      <div class="nested-fields"></div>
      <button type="button" class="btn btn-sm btn-secondary mt-1" onclick="addNestedField(this)">Add Nested Field</button>
    `;
  }

  // Array of only primitive item types
  if (type === "array") {
    container.innerHTML=`
      <input type="number" class="form-control mb-1 array-length" placeholder="Length (optional)">
      <select class="form-select item-type mb-1">
        <option value="string">string</option>
        <option value="integer">integer</option>
        <option value="float">float</option>
        <option value="boolean">boolean</option>
        <option value="name" selected>name</option>
        <option value="email">email</option>
        <option value="phone">phone</option>
        <option value="date">date</option>
        <option value="uuid">uuid</option>
        <option value="image_url">image_url</option>
        <option value="file_url">file_url</option>
      </select>
    `;
  }
}

function addNestedField(btn) {
  const container=btn.previousElementSibling;
  const div=document.createElement("div");
  div.className="row mt-1";

  div.innerHTML=`
    <div class="col-6">
      <input class="form-control nested-field-name" placeholder="Nested field name">
    </div>
    <div class="col-5">
      <select class="form-select nested-field-type">
        <option value="string">string</option>
        <option value="integer">integer</option>
        <option value="float">float</option>
        <option value="boolean">boolean</option>
        <option value="name" selected>name</option>
        <option value="email">email</option>
        <option value="phone">phone</option>
        <option value="date">date</option>
        <option value="uuid">uuid</option>
        <option value="image_url">image_url</option>
        <option value="file_url">file_url</option>
      </select>
    </div>
    <div class="col-1">
      <button class="btn btn-sm btn-danger" onclick="this.closest('.row').remove()">✖</button>
    </div>
  `;

  container.appendChild(div);
}

async function generate() {
  const output=document.getElementById("output");

  const countInput=document.getElementById("count");
  const count=Number(countInput.value);

  if (!Number.isInteger(count) || count <= 0) {
    output.textContent="Error: Count must be a positive integer.";
    countInput.classList.add("is-invalid");
    return;
  } 
  else {
    countInput.classList.remove("is-invalid");
  }

  const rows=document.querySelectorAll("#fields .row");
  const schema={};
  let hasError=false;

  rows.forEach(row => {
    const nameInput=row.querySelector(".field-name");
    const typeSelect=row.querySelector(".field-type");
    const constraints=row.querySelector(".constraints");

    const name=nameInput.value.trim();
    const type=typeSelect.value;

    if (!name) {
      nameInput.classList.add("is-invalid");
      hasError=true;
      return;
    } 
    else {
      nameInput.classList.remove("is-invalid");
    }

    const fieldSchema={ type };

    // range
    if (type === "integer" || type === "float") {
      const minVal=constraints.querySelector(".min")?.value;
      const maxVal=constraints.querySelector(".max")?.value;

      if (minVal !== "" && maxVal !== "" && Number(minVal) > Number(maxVal)) {
        output.textContent=`Error: Min cannot be greater than Max for "${name}"`;
        hasError=true;
        return;
      }

      if (minVal !== "") fieldSchema.min=Number(minVal);
      if (maxVal !== "") fieldSchema.max=Number(maxVal);
    }

    // regex & enum
    if (type === "string") {
      const regexInput=constraints.querySelector(".regex");
      const enumInput=constraints.querySelector(".enum");

      const regexVal=regexInput ? regexInput.value.trim() : "";
      const enumVal=enumInput ? enumInput.value.trim() : "";

      if (regexVal && enumVal) {
        output.textContent=`Error: Use either Regex OR Enum for "${name}", not both.`;
        hasError=true;
        return;
      }

      if (regexVal) {
        try {
          new RegExp(regexVal);
          fieldSchema.regex=regexVal;
        } 
        catch {
          output.textContent=`Error: Invalid regex for "${name}"`;
          hasError=true;
          return;
        }
      }

      if (enumVal) {
        const enumList=enumVal.split(",").map(v => v.trim()).filter(Boolean);
        if (!enumList.length) {
          output.textContent=`Error: Enum cannot be empty for "${name}"`;
          hasError=true;
          return;
        }
        fieldSchema.enum=enumList;
      }
    }

    // object
    if (type === "object") {
      const nestedRows=constraints.querySelectorAll(".nested-fields .row");
      const nestedSchema={};
      if (!nestedRows.length) {
        output.textContent=`Error: Object "${name}" must have at least one nested field.`;
        hasError=true;
        return;
      }
      nestedRows.forEach(nRow => {
        const nName=nRow.querySelector(".nested-field-name").value.trim();
        const nType=nRow.querySelector(".nested-field-type").value;
        if (!nName) {
          output.textContent=`Error: Nested field name cannot be empty in object "${name}"`;
          hasError=true;
          return;
        }
        nestedSchema[nName]={ type: nType };
      });
      if (hasError) return;
      fieldSchema.schema=nestedSchema;
    }

    // array
    if (type === "array") {
      const lengthVal=constraints.querySelector(".array-length")?.value;
      const itemType=constraints.querySelector(".item-type")?.value;
      fieldSchema.length=lengthVal ? Number(lengthVal) : undefined;
      fieldSchema.items={ type: itemType }; // only primitives
    }

    schema[name]=fieldSchema;
  });

  if(hasError){return;}

  try {
    const response=await axios.post("/generate", { schema, count });
    const data=response.data;
    output.textContent=JSON.stringify(data, null, 2);

    const apiInput=document.getElementById("api-url").value.trim();
    if (apiInput) {
      const apiUrls=apiInput.split(",").map(url => url.trim()).filter(Boolean);
      for (const url of apiUrls) {
        try {
          await axios.post(url, data);
          console.log(`Data sent successfully to ${url}`);
        } catch (err) {
          console.error(`Failed to send data to ${url}:`, err);
        }
      }
      alert("Attempted to send data to all specified API endpoints. Check console for errors.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    output.textContent="Error fetching data";
  }
}