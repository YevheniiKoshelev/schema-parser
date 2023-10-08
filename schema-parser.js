// Rules:
// 1 Not required fields still can be returned
// 2 Number can have optional limits('minimum', 'maximum')
// 3 Array type should contain items works with default value (default unnecessary)
// 4 String type with format prop works should fit pattern
// 5 $ref works with reference id ($id)
// 6 Reserved fields: ["id" ,"$id", "type", "properties", "enum", "anyOf", "$ref", "default", "format", "pattern", "minimum", "maximum", "exclusiveMinimum", "required", "items", "minItems", "uniqueItems", "definitions"]
// 7 Each layer should have one of: ['type', 'enum', 'anyOf', '$ref']

// Test object
const testObj = {
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    attendees: {
      type: "object",
      $id: "#attendees",
      properties: {
        userId: {
          type: "integer",
        },
        access: {
          enum: ["view", "modify", "sign", "execute"],
        },
        formAccess: {
          enum: ["view", "execute", "execute_view"],
        },
      },
      required: ["userId", "access"],
    },
  },
  type: "object",
  properties: {
    id: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "integer",
        },
      ],
    },
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    startDate: {
      type: "integer",
    },
    endDate: {
      type: "integer",
    },
    attendees: {
      type: "array",
      items: {
        $ref: "#attendees",
      },
      default: [],
    },
    parentId: {
      anyOf: [
        {
          type: "null",
        },
        {
          type: "string",
        },
        {
          type: "integer",
        },
      ],
    },
    locationId: {
      anyOf: [
        {
          type: "null",
        },
        {
          type: "integer",
        },
      ],
    },
    process: {
      anyOf: [
        {
          type: "null",
        },
        {
          type: "string",
          format: "regex",
          pattern:
            "https:\\/\\/[a-z]+\\.corezoid\\.com\\/api\\/1\\/json\\/public\\/[0-9]+\\/[0-9a-zA-Z]+",
        },
      ],
    },
    readOnly: {
      type: "boolean",
    },
    priorProbability: {
      anyOf: [
        {
          type: "null",
        },
        {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
      ],
    },
    channelId: {
      anyOf: [
        {
          type: "null",
        },
        {
          type: "integer",
        },
      ],
    },
    externalId: {
      anyOf: [
        {
          type: "null",
        },
        {
          type: "string",
        },
      ],
    },
    tags: {
      type: "array",
    },
    form: {
      type: "object",
      properties: {
        id: {
          type: "integer",
        },
        viewModel: {
          type: "object",
        },
      },
      required: ["id"],
    },
    formValue: {
      type: "object",
    },
  },
  required: ["id", "title", "description", "startDate", "endDate", "attendees"],
};

// Enums
const SchemaTypes = Object.freeze({
  Object: "object",
  Null: "null",
  Boolean: "boolean",
  Integer: "integer",
  String: "string",
  Array: "array",
});

const RegExpReplacementTypes = Object.freeze({
  Reflection: "\\",
  Number: "[0-9]+",
  LowerCaseString: "[a-z]+",
  NumbersAndString: "[0-9a-zA-Z]+",
});

const UtilTypes = Object.freeze({
  Object: "object",
  TrueObject: "[object Object]",
  ReferenceID: "$id",
  // Used to get ASCII char:
  LetterMinRange: 97,
  LetterMaxRenge: 122,
  CapitalLetterMinRange: 65,
  CapitalLetterMaxRenge: 90,
});

// Run schema parser for test object
console.log("schemaParser: => ", schemaParser(testObj));

// Main func
function schemaParser(obj) {
  // Stamp all definitions
  this.definitions = getDefinitions(obj);

  return handlerService(obj);
}

// Main handlers
function handlerService(params) {
  if (!params) {
    return;
  }

  if (params.type) {
    switch (params.type) {
      case SchemaTypes.Object:
        return ojectHandler(params);

      case SchemaTypes.Null:
        return nullHandler();

      case SchemaTypes.Boolean:
        return booleanHandler();

      case SchemaTypes.Integer:
        return numberHandler(params);

      case SchemaTypes.String:
        return stringHandler(params);

      case SchemaTypes.Array:
        return arrayHandler(params);

      default:
        return;
    }
  } else if (params.enum) {
    return enumHandler(params);
  } else if (params.anyOf) {
    return anyOfHandler(params);
  } else if (params.$ref) {
    return refHandler(params);
  }

  return;
}

// Handlers for types
function ojectHandler(params) {
  if (Object.prototype.toString.call(params) !== UtilTypes.TrueObject) {
    return undefined;
  }

  return params.properties ? propertiesHandler(params.properties) : {};
}

function numberHandler({ maximum, minimum }) {
  return getRandomRangeInt(maximum, minimum);
}

function nullHandler() {
  return null;
}

function stringHandler({ format, pattern }) {
  if (format && pattern) {
    return getStringByPattern(pattern);
  }

  return getRandomString(getRandomRangeInt(10, 5));
}

function booleanHandler() {
  return getRandomBoolean();
}

function arrayHandler(params) {
  const outArr = params.default ? params.default : [];

  if (params.items) {
    outArr.push(handlerService(params.items));
  }

  return outArr;
}

// Handlers for reserved keys
function propertiesHandler(params) {
  const outObj = {};

  for (const key in params) {
    outObj[key] = handlerService(params[key]);
  }

  return outObj;
}

function anyOfHandler(params) {
  return handlerService(getRandomArrEl(params.anyOf));
}

function enumHandler(params) {
  return getRandomArrEl(params.enum);
}

function refHandler({ $ref }) {
  return handlerService(this.definitions.find((el) => el.$id === $ref));
}

// Utils
function getRandomRangeInt(max = 100, min = 0) {
  const floor = Math.floor(max);
  const ceil = Math.ceil(min);

  // A random number including an upper and lower limit
  return Math.floor(Math.random() * (floor - ceil + 1)) + ceil;
}

function getRandomArrEl(arr) {
  if (Array.isArray(arr) && arr.length) {
    return arr[getRandomRangeInt(arr.length - 1)];
  }
}

function getRandomBoolean() {
  return !getRandomRangeInt(1);
}

function getRandomString(length, allowCapital) {
  const chars = [];

  while (chars.length < length) {
    // Insert a capital letter if they are allowed and good luck on her side
    if (allowCapital && getRandomBoolean()) {
      chars.push(
        getRandomRangeInt(
          UtilTypes.CapitalLetterMaxRenge,
          UtilTypes.CapitalLetterMinRange
        )
      );
    } else {
      chars.push(
        getRandomRangeInt(UtilTypes.LetterMaxRenge, UtilTypes.LetterMinRange)
      );
    }
  }

  return String.fromCharCode(...chars);
}

// A very specific function, works only with specified RegExp expressions
function getStringByPattern(pattern) {
  return pattern
    .replaceAll(RegExpReplacementTypes.Reflection, "")
    .replaceAll(RegExpReplacementTypes.Number, getRandomRangeInt())
    .replaceAll(
      RegExpReplacementTypes.LowerCaseString,
      getRandomString(getRandomRangeInt(5, 1))
    )
    .replaceAll(
      RegExpReplacementTypes.NumbersAndString,
      getRandomString(getRandomRangeInt(5, 1), true)
    );
}

function getDefinitions(obj) {
  const objects = [];

  for (const prop in obj) {
    // Skip out all fake obj(null, array, new...)
    if (!obj.hasOwnProperty(prop)) {
      continue;
    }

    // Make a flat array for easy access by reference id
    if (typeof obj[prop] === UtilTypes.Object) {
      objects.push(...getDefinitions(obj[prop]));
    } else if (prop === UtilTypes.ReferenceID) {
      objects.push(obj);
    }
  }

  return objects;
}

// Run UT
unitTestFrameWork();

// Unit Tests
function unitTestFrameWork() {
  return runTests();

  function runTests() {
    schemaParserTest();
    getRandomRangeIntTest();
    getRandomArrElTest();
    getRandomBooleanTest();
    getRandomStringTest();
    getStringByPatternTest();
    getDefinitionsTest();
  }

  function isEqual(actual, expected) {
    return actual === expected;
  }

  function resultMsg(result) {
    return result ? "PASS" : "FAIL";
  }

  function schemaParserTest() {
    const expect = {
      id: 1,
      name: "str",
      nullable: null,
      editable: false,
      form: {
        id: 1,
        description: "str",
      },
    };
    const result = schemaParser({
      type: "object",
      properties: {
        id: {
          type: "integer",
        },
        name: {
          type: "string",
        },
        nullable: {
          type: "null",
        },
        editable: {
          type: "boolean",
        },
        form: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            description: {
              type: "string",
            },
          },
        },
      },
    });

    function toMatchObject(actual, expected) {
      for (const key in expected) {
        if (expected.hasOwnProperty(key)) {
          if (
            !actual.hasOwnProperty(key) ||
            typeof actual[key] !== typeof expected[key]
          ) {
            return false;
          }

          if (
            typeof expected[key] === "object" &&
            !toMatchObject(actual[key], expected[key])
          ) {
            return false;
          }
        }
      }

      return true;
    }

    console.log(
      `schemaParserTest => ${resultMsg(toMatchObject(result, expect))}`
    );
  }

  function getRandomRangeIntTest() {
    const result = getRandomRangeInt(10, 5);

    console.log(
      `getRandomRangeIntTest => is type equal => ${resultMsg(
        isEqual(typeof result, "number")
      )}`
    );
    console.log(
      `getRandomRangeIntTest => in limits => ${resultMsg(
        result >= 5 && result <= 10
      )}`
    );
  }

  function getRandomArrElTest() {
    const arr = [1, 2, 3, 4, 5];
    const result = getRandomArrEl(arr);

    console.log(`getRandomArrElTest => ${resultMsg(arr.includes(result))}`);
  }

  function getRandomBooleanTest() {
    const result = getRandomBoolean();

    console.log(
      `getRandomBooleanTest => ${resultMsg(isEqual(typeof result, "boolean"))}`
    );
  }

  function getRandomStringTest() {
    const result = getRandomString(10, 5);

    console.log(
      `getRandomStringTest => is type equal => ${resultMsg(
        isEqual(typeof result, "string")
      )}`
    );
    console.log(
      `getRandomStringTest => is length equal => ${resultMsg(
        isEqual(result.length, 10)
      )}`
    );
  }

  function getStringByPatternTest() {
    const result = getStringByPattern("[a-z]+");

    console.log(
      `getStringByPatternTest => is type equal => ${resultMsg(
        isEqual(typeof result, "string")
      )}`
    );
    console.log(
      `getStringByPatternTest => is string match => ${resultMsg(
        /[a-z]+/g.test(result)
      )}`
    );
  }

  function getDefinitionsTest() {
    const result = getDefinitions();

    console.log(
      `getDefinitionsTest => ${resultMsg(isEqual(Array.isArray(result), true))}`
    );
  }
}
