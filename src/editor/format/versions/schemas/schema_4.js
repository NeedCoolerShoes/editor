import AJV from "../../ajv.js";

const schema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      pattern: "^application/vnd\\.needcoolershoes\\.ncrs\\+json$"
    },
    format: {type: "integer"},
    project: {
      type: "object",
      properties: {
        id: {type: "string"},
        name: {type: "string"},
        createdAt: {type: "integer"},
        modifiedAt: {type: "integer"},
      }
    },
    variant: {
      type: "string",
      pattern: "^(classic|slim)$"
    },
    layers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          filters: {type: "array"},
          data: {type: "string"},
          metadata: {
            type: "object",
            properties: {
              attribution: {type: "string"}
            }
          },
          selected: {type: "boolean"},
          visible: {type: "boolean"},
        }
      }
    },
    blendPalette: {
      type: "array",
      items: {
        type: "string",
        pattern: "^#([a-fA-F0-9]{8}|[a-fA-F0-9]{6})$"
      }
    }
  }
}

let schema4;

function validate(data) {
  if (!schema4) {
    schema4 = AJV.compile(schema);
  }

  const valid = schema4(data);
  if (!valid) console.log(schema4.errors, data);

  return valid;
}

export default validate;