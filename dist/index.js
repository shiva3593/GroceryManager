var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/drizzle-orm/entity.cjs
var require_entity = __commonJS({
  "node_modules/drizzle-orm/entity.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var entity_exports = {};
    __export2(entity_exports, {
      entityKind: () => entityKind,
      hasOwnEntityKind: () => hasOwnEntityKind,
      is: () => is
    });
    module.exports = __toCommonJS(entity_exports);
    var entityKind = Symbol.for("drizzle:entityKind");
    var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
    function is(value, type) {
      if (!value || typeof value !== "object") {
        return false;
      }
      if (value instanceof type) {
        return true;
      }
      if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
        throw new Error(
          `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
        );
      }
      let cls = Object.getPrototypeOf(value).constructor;
      if (cls) {
        while (cls) {
          if (entityKind in cls && cls[entityKind] === type[entityKind]) {
            return true;
          }
          cls = Object.getPrototypeOf(cls);
        }
      }
      return false;
    }
  }
});

// node_modules/drizzle-orm/column.cjs
var require_column = __commonJS({
  "node_modules/drizzle-orm/column.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var column_exports = {};
    __export2(column_exports, {
      Column: () => Column
    });
    module.exports = __toCommonJS(column_exports);
    var import_entity = require_entity();
    var Column = class {
      constructor(table, config) {
        this.table = table;
        this.config = config;
        this.name = config.name;
        this.keyAsName = config.keyAsName;
        this.notNull = config.notNull;
        this.default = config.default;
        this.defaultFn = config.defaultFn;
        this.onUpdateFn = config.onUpdateFn;
        this.hasDefault = config.hasDefault;
        this.primary = config.primaryKey;
        this.isUnique = config.isUnique;
        this.uniqueName = config.uniqueName;
        this.uniqueType = config.uniqueType;
        this.dataType = config.dataType;
        this.columnType = config.columnType;
        this.generated = config.generated;
        this.generatedIdentity = config.generatedIdentity;
      }
      static [import_entity.entityKind] = "Column";
      name;
      keyAsName;
      primary;
      notNull;
      default;
      defaultFn;
      onUpdateFn;
      hasDefault;
      isUnique;
      uniqueName;
      uniqueType;
      dataType;
      columnType;
      enumValues = void 0;
      generated = void 0;
      generatedIdentity = void 0;
      config;
      mapFromDriverValue(value) {
        return value;
      }
      mapToDriverValue(value) {
        return value;
      }
      // ** @internal */
      shouldDisableInsert() {
        return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
      }
    };
  }
});

// node_modules/drizzle-orm/column-builder.cjs
var require_column_builder = __commonJS({
  "node_modules/drizzle-orm/column-builder.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var column_builder_exports = {};
    __export2(column_builder_exports, {
      ColumnBuilder: () => ColumnBuilder
    });
    module.exports = __toCommonJS(column_builder_exports);
    var import_entity = require_entity();
    var ColumnBuilder = class {
      static [import_entity.entityKind] = "ColumnBuilder";
      config;
      constructor(name, dataType, columnType) {
        this.config = {
          name,
          keyAsName: name === "",
          notNull: false,
          default: void 0,
          hasDefault: false,
          primaryKey: false,
          isUnique: false,
          uniqueName: void 0,
          uniqueType: void 0,
          dataType,
          columnType,
          generated: void 0
        };
      }
      /**
       * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
       *
       * @example
       * ```ts
       * const users = pgTable('users', {
       * 	id: integer('id').$type<UserId>().primaryKey(),
       * 	details: json('details').$type<UserDetails>().notNull(),
       * });
       * ```
       */
      $type() {
        return this;
      }
      /**
       * Adds a `not null` clause to the column definition.
       *
       * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
       */
      notNull() {
        this.config.notNull = true;
        return this;
      }
      /**
       * Adds a `default <value>` clause to the column definition.
       *
       * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
       *
       * If you need to set a dynamic default value, use {@link $defaultFn} instead.
       */
      default(value) {
        this.config.default = value;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Adds a dynamic default value to the column.
       * The function will be called when the row is inserted, and the returned value will be used as the column value.
       *
       * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
       */
      $defaultFn(fn) {
        this.config.defaultFn = fn;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Alias for {@link $defaultFn}.
       */
      $default = this.$defaultFn;
      /**
       * Adds a dynamic update value to the column.
       * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
       * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
       *
       * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
       */
      $onUpdateFn(fn) {
        this.config.onUpdateFn = fn;
        this.config.hasDefault = true;
        return this;
      }
      /**
       * Alias for {@link $onUpdateFn}.
       */
      $onUpdate = this.$onUpdateFn;
      /**
       * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
       *
       * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
       */
      primaryKey() {
        this.config.primaryKey = true;
        this.config.notNull = true;
        return this;
      }
      /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
      setName(name) {
        if (this.config.name !== "")
          return;
        this.config.name = name;
      }
    };
  }
});

// node_modules/drizzle-orm/table.utils.cjs
var require_table_utils = __commonJS({
  "node_modules/drizzle-orm/table.utils.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var table_utils_exports = {};
    __export2(table_utils_exports, {
      TableName: () => TableName
    });
    module.exports = __toCommonJS(table_utils_exports);
    var TableName = Symbol.for("drizzle:Name");
  }
});

// node_modules/drizzle-orm/pg-core/foreign-keys.cjs
var require_foreign_keys = __commonJS({
  "node_modules/drizzle-orm/pg-core/foreign-keys.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var foreign_keys_exports = {};
    __export2(foreign_keys_exports, {
      ForeignKey: () => ForeignKey,
      ForeignKeyBuilder: () => ForeignKeyBuilder,
      foreignKey: () => foreignKey
    });
    module.exports = __toCommonJS(foreign_keys_exports);
    var import_entity = require_entity();
    var import_table_utils = require_table_utils();
    var ForeignKeyBuilder = class {
      static [import_entity.entityKind] = "PgForeignKeyBuilder";
      /** @internal */
      reference;
      /** @internal */
      _onUpdate = "no action";
      /** @internal */
      _onDelete = "no action";
      constructor(config, actions) {
        this.reference = () => {
          const { name, columns, foreignColumns } = config();
          return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
        };
        if (actions) {
          this._onUpdate = actions.onUpdate;
          this._onDelete = actions.onDelete;
        }
      }
      onUpdate(action) {
        this._onUpdate = action === void 0 ? "no action" : action;
        return this;
      }
      onDelete(action) {
        this._onDelete = action === void 0 ? "no action" : action;
        return this;
      }
      /** @internal */
      build(table) {
        return new ForeignKey(table, this);
      }
    };
    var ForeignKey = class {
      constructor(table, builder) {
        this.table = table;
        this.reference = builder.reference;
        this.onUpdate = builder._onUpdate;
        this.onDelete = builder._onDelete;
      }
      static [import_entity.entityKind] = "PgForeignKey";
      reference;
      onUpdate;
      onDelete;
      getName() {
        const { name, columns, foreignColumns } = this.reference();
        const columnNames = columns.map((column) => column.name);
        const foreignColumnNames = foreignColumns.map((column) => column.name);
        const chunks = [
          this.table[import_table_utils.TableName],
          ...columnNames,
          foreignColumns[0].table[import_table_utils.TableName],
          ...foreignColumnNames
        ];
        return name ?? `${chunks.join("_")}_fk`;
      }
    };
    function foreignKey(config) {
      function mappedConfig() {
        const { name, columns, foreignColumns } = config;
        return {
          name,
          columns,
          foreignColumns
        };
      }
      return new ForeignKeyBuilder(mappedConfig);
    }
  }
});

// node_modules/drizzle-orm/tracing-utils.cjs
var require_tracing_utils = __commonJS({
  "node_modules/drizzle-orm/tracing-utils.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var tracing_utils_exports = {};
    __export2(tracing_utils_exports, {
      iife: () => iife
    });
    module.exports = __toCommonJS(tracing_utils_exports);
    function iife(fn, ...args) {
      return fn(...args);
    }
  }
});

// node_modules/drizzle-orm/pg-core/unique-constraint.cjs
var require_unique_constraint = __commonJS({
  "node_modules/drizzle-orm/pg-core/unique-constraint.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var unique_constraint_exports = {};
    __export2(unique_constraint_exports, {
      UniqueConstraint: () => UniqueConstraint,
      UniqueConstraintBuilder: () => UniqueConstraintBuilder,
      UniqueOnConstraintBuilder: () => UniqueOnConstraintBuilder,
      unique: () => unique,
      uniqueKeyName: () => uniqueKeyName
    });
    module.exports = __toCommonJS(unique_constraint_exports);
    var import_entity = require_entity();
    var import_table_utils = require_table_utils();
    function unique(name) {
      return new UniqueOnConstraintBuilder(name);
    }
    function uniqueKeyName(table, columns) {
      return `${table[import_table_utils.TableName]}_${columns.join("_")}_unique`;
    }
    var UniqueConstraintBuilder = class {
      constructor(columns, name) {
        this.name = name;
        this.columns = columns;
      }
      static [import_entity.entityKind] = "PgUniqueConstraintBuilder";
      /** @internal */
      columns;
      /** @internal */
      nullsNotDistinctConfig = false;
      nullsNotDistinct() {
        this.nullsNotDistinctConfig = true;
        return this;
      }
      /** @internal */
      build(table) {
        return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
      }
    };
    var UniqueOnConstraintBuilder = class {
      static [import_entity.entityKind] = "PgUniqueOnConstraintBuilder";
      /** @internal */
      name;
      constructor(name) {
        this.name = name;
      }
      on(...columns) {
        return new UniqueConstraintBuilder(columns, this.name);
      }
    };
    var UniqueConstraint = class {
      constructor(table, columns, nullsNotDistinct, name) {
        this.table = table;
        this.columns = columns;
        this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
        this.nullsNotDistinct = nullsNotDistinct;
      }
      static [import_entity.entityKind] = "PgUniqueConstraint";
      columns;
      name;
      nullsNotDistinct = false;
      getName() {
        return this.name;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/utils/array.cjs
var require_array = __commonJS({
  "node_modules/drizzle-orm/pg-core/utils/array.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var array_exports = {};
    __export2(array_exports, {
      makePgArray: () => makePgArray,
      parsePgArray: () => parsePgArray,
      parsePgNestedArray: () => parsePgNestedArray
    });
    module.exports = __toCommonJS(array_exports);
    function parsePgArrayValue(arrayString, startFrom, inQuotes) {
      for (let i = startFrom; i < arrayString.length; i++) {
        const char = arrayString[i];
        if (char === "\\") {
          i++;
          continue;
        }
        if (char === '"') {
          return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
        }
        if (inQuotes) {
          continue;
        }
        if (char === "," || char === "}") {
          return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
        }
      }
      return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
    }
    function parsePgNestedArray(arrayString, startFrom = 0) {
      const result = [];
      let i = startFrom;
      let lastCharIsComma = false;
      while (i < arrayString.length) {
        const char = arrayString[i];
        if (char === ",") {
          if (lastCharIsComma || i === startFrom) {
            result.push("");
          }
          lastCharIsComma = true;
          i++;
          continue;
        }
        lastCharIsComma = false;
        if (char === "\\") {
          i += 2;
          continue;
        }
        if (char === '"') {
          const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
          result.push(value2);
          i = startFrom2;
          continue;
        }
        if (char === "}") {
          return [result, i + 1];
        }
        if (char === "{") {
          const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
          result.push(value2);
          i = startFrom2;
          continue;
        }
        const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
        result.push(value);
        i = newStartFrom;
      }
      return [result, i];
    }
    function parsePgArray(arrayString) {
      const [result] = parsePgNestedArray(arrayString, 1);
      return result;
    }
    function makePgArray(array) {
      return `{${array.map((item) => {
        if (Array.isArray(item)) {
          return makePgArray(item);
        }
        if (typeof item === "string") {
          return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        }
        return `${item}`;
      }).join(",")}}`;
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/common.cjs
var require_common = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/common.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var common_exports = {};
    __export2(common_exports, {
      ExtraConfigColumn: () => ExtraConfigColumn,
      IndexedColumn: () => IndexedColumn,
      PgArray: () => PgArray,
      PgArrayBuilder: () => PgArrayBuilder,
      PgColumn: () => PgColumn,
      PgColumnBuilder: () => PgColumnBuilder
    });
    module.exports = __toCommonJS(common_exports);
    var import_column_builder = require_column_builder();
    var import_column = require_column();
    var import_entity = require_entity();
    var import_foreign_keys = require_foreign_keys();
    var import_tracing_utils = require_tracing_utils();
    var import_unique_constraint = require_unique_constraint();
    var import_array = require_array();
    var PgColumnBuilder = class extends import_column_builder.ColumnBuilder {
      foreignKeyConfigs = [];
      static [import_entity.entityKind] = "PgColumnBuilder";
      array(size) {
        return new PgArrayBuilder(this.config.name, this, size);
      }
      references(ref, actions = {}) {
        this.foreignKeyConfigs.push({ ref, actions });
        return this;
      }
      unique(name, config) {
        this.config.isUnique = true;
        this.config.uniqueName = name;
        this.config.uniqueType = config?.nulls;
        return this;
      }
      generatedAlwaysAs(as) {
        this.config.generated = {
          as,
          type: "always",
          mode: "stored"
        };
        return this;
      }
      /** @internal */
      buildForeignKeys(column, table) {
        return this.foreignKeyConfigs.map(({ ref, actions }) => {
          return (0, import_tracing_utils.iife)(
            (ref2, actions2) => {
              const builder = new import_foreign_keys.ForeignKeyBuilder(() => {
                const foreignColumn = ref2();
                return { columns: [column], foreignColumns: [foreignColumn] };
              });
              if (actions2.onUpdate) {
                builder.onUpdate(actions2.onUpdate);
              }
              if (actions2.onDelete) {
                builder.onDelete(actions2.onDelete);
              }
              return builder.build(table);
            },
            ref,
            actions
          );
        });
      }
      /** @internal */
      buildExtraConfigColumn(table) {
        return new ExtraConfigColumn(table, this.config);
      }
    };
    var PgColumn = class extends import_column.Column {
      constructor(table, config) {
        if (!config.uniqueName) {
          config.uniqueName = (0, import_unique_constraint.uniqueKeyName)(table, [config.name]);
        }
        super(table, config);
        this.table = table;
      }
      static [import_entity.entityKind] = "PgColumn";
    };
    var ExtraConfigColumn = class extends PgColumn {
      static [import_entity.entityKind] = "ExtraConfigColumn";
      getSQLType() {
        return this.getSQLType();
      }
      indexConfig = {
        order: this.config.order ?? "asc",
        nulls: this.config.nulls ?? "last",
        opClass: this.config.opClass
      };
      defaultConfig = {
        order: "asc",
        nulls: "last",
        opClass: void 0
      };
      asc() {
        this.indexConfig.order = "asc";
        return this;
      }
      desc() {
        this.indexConfig.order = "desc";
        return this;
      }
      nullsFirst() {
        this.indexConfig.nulls = "first";
        return this;
      }
      nullsLast() {
        this.indexConfig.nulls = "last";
        return this;
      }
      /**
       * ### PostgreSQL documentation quote
       *
       * > An operator class with optional parameters can be specified for each column of an index.
       * The operator class identifies the operators to be used by the index for that column.
       * For example, a B-tree index on four-byte integers would use the int4_ops class;
       * this operator class includes comparison functions for four-byte integers.
       * In practice the default operator class for the column's data type is usually sufficient.
       * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
       * For example, we might want to sort a complex-number data type either by absolute value or by real part.
       * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
       * More information about operator classes check:
       *
       * ### Useful links
       * https://www.postgresql.org/docs/current/sql-createindex.html
       *
       * https://www.postgresql.org/docs/current/indexes-opclass.html
       *
       * https://www.postgresql.org/docs/current/xindex.html
       *
       * ### Additional types
       * If you have the `pg_vector` extension installed in your database, you can use the
       * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
       *
       * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
       *
       * @param opClass
       * @returns
       */
      op(opClass) {
        this.indexConfig.opClass = opClass;
        return this;
      }
    };
    var IndexedColumn = class {
      static [import_entity.entityKind] = "IndexedColumn";
      constructor(name, keyAsName, type, indexConfig) {
        this.name = name;
        this.keyAsName = keyAsName;
        this.type = type;
        this.indexConfig = indexConfig;
      }
      name;
      keyAsName;
      type;
      indexConfig;
    };
    var PgArrayBuilder = class extends PgColumnBuilder {
      static [import_entity.entityKind] = "PgArrayBuilder";
      constructor(name, baseBuilder, size) {
        super(name, "array", "PgArray");
        this.config.baseBuilder = baseBuilder;
        this.config.size = size;
      }
      /** @internal */
      build(table) {
        const baseColumn = this.config.baseBuilder.build(table);
        return new PgArray(
          table,
          this.config,
          baseColumn
        );
      }
    };
    var PgArray = class _PgArray extends PgColumn {
      constructor(table, config, baseColumn, range) {
        super(table, config);
        this.baseColumn = baseColumn;
        this.range = range;
        this.size = config.size;
      }
      size;
      static [import_entity.entityKind] = "PgArray";
      getSQLType() {
        return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          value = (0, import_array.parsePgArray)(value);
        }
        return value.map((v) => this.baseColumn.mapFromDriverValue(v));
      }
      mapToDriverValue(value, isNestedArray = false) {
        const a = value.map(
          (v) => v === null ? null : (0, import_entity.is)(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
        );
        if (isNestedArray)
          return a;
        return (0, import_array.makePgArray)(a);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/enum.cjs
var require_enum = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/enum.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var enum_exports = {};
    __export2(enum_exports, {
      PgEnumColumn: () => PgEnumColumn,
      PgEnumColumnBuilder: () => PgEnumColumnBuilder,
      isPgEnum: () => isPgEnum,
      pgEnum: () => pgEnum,
      pgEnumWithSchema: () => pgEnumWithSchema
    });
    module.exports = __toCommonJS(enum_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
    function isPgEnum(obj) {
      return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
    }
    var PgEnumColumnBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgEnumColumnBuilder";
      constructor(name, enumInstance) {
        super(name, "string", "PgEnumColumn");
        this.config.enum = enumInstance;
      }
      /** @internal */
      build(table) {
        return new PgEnumColumn(
          table,
          this.config
        );
      }
    };
    var PgEnumColumn = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgEnumColumn";
      enum = this.config.enum;
      enumValues = this.config.enum.enumValues;
      constructor(table, config) {
        super(table, config);
        this.enum = config.enum;
      }
      getSQLType() {
        return this.enum.enumName;
      }
    };
    function pgEnum(enumName, values) {
      return pgEnumWithSchema(enumName, values, void 0);
    }
    function pgEnumWithSchema(enumName, values, schema) {
      const enumInstance = Object.assign(
        (name) => new PgEnumColumnBuilder(name ?? "", enumInstance),
        {
          enumName,
          enumValues: values,
          schema,
          [isPgEnumSym]: true
        }
      );
      return enumInstance;
    }
  }
});

// node_modules/drizzle-orm/subquery.cjs
var require_subquery = __commonJS({
  "node_modules/drizzle-orm/subquery.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var subquery_exports = {};
    __export2(subquery_exports, {
      Subquery: () => Subquery,
      WithSubquery: () => WithSubquery
    });
    module.exports = __toCommonJS(subquery_exports);
    var import_entity = require_entity();
    var Subquery = class {
      static [import_entity.entityKind] = "Subquery";
      constructor(sql3, selection, alias, isWith = false) {
        this._ = {
          brand: "Subquery",
          sql: sql3,
          selectedFields: selection,
          alias,
          isWith
        };
      }
      // getSQL(): SQL<unknown> {
      // 	return new SQL([this]);
      // }
    };
    var WithSubquery = class extends Subquery {
      static [import_entity.entityKind] = "WithSubquery";
    };
  }
});

// node_modules/drizzle-orm/version.cjs
var require_version = __commonJS({
  "node_modules/drizzle-orm/version.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var version_exports = {};
    __export2(version_exports, {
      compatibilityVersion: () => compatibilityVersion,
      npmVersion: () => version
    });
    module.exports = __toCommonJS(version_exports);
    var version = "0.38.4";
    var compatibilityVersion = 10;
  }
});

// node_modules/drizzle-orm/tracing.cjs
var require_tracing = __commonJS({
  "node_modules/drizzle-orm/tracing.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var tracing_exports = {};
    __export2(tracing_exports, {
      tracer: () => tracer
    });
    module.exports = __toCommonJS(tracing_exports);
    var import_tracing_utils = require_tracing_utils();
    var import_version = require_version();
    var otel;
    var rawTracer;
    var tracer = {
      startActiveSpan(name, fn) {
        if (!otel) {
          return fn();
        }
        if (!rawTracer) {
          rawTracer = otel.trace.getTracer("drizzle-orm", import_version.npmVersion);
        }
        return (0, import_tracing_utils.iife)(
          (otel2, rawTracer2) => rawTracer2.startActiveSpan(
            name,
            (span) => {
              try {
                return fn(span);
              } catch (e) {
                span.setStatus({
                  code: otel2.SpanStatusCode.ERROR,
                  message: e instanceof Error ? e.message : "Unknown error"
                  // eslint-disable-line no-instanceof/no-instanceof
                });
                throw e;
              } finally {
                span.end();
              }
            }
          ),
          otel,
          rawTracer
        );
      }
    };
  }
});

// node_modules/drizzle-orm/view-common.cjs
var require_view_common = __commonJS({
  "node_modules/drizzle-orm/view-common.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var view_common_exports = {};
    __export2(view_common_exports, {
      ViewBaseConfig: () => ViewBaseConfig
    });
    module.exports = __toCommonJS(view_common_exports);
    var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");
  }
});

// node_modules/drizzle-orm/table.cjs
var require_table = __commonJS({
  "node_modules/drizzle-orm/table.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var table_exports = {};
    __export2(table_exports, {
      BaseName: () => BaseName,
      Columns: () => Columns,
      ExtraConfigBuilder: () => ExtraConfigBuilder,
      ExtraConfigColumns: () => ExtraConfigColumns,
      IsAlias: () => IsAlias,
      OriginalName: () => OriginalName,
      Schema: () => Schema,
      Table: () => Table,
      getTableName: () => getTableName,
      getTableUniqueName: () => getTableUniqueName,
      isTable: () => isTable
    });
    module.exports = __toCommonJS(table_exports);
    var import_entity = require_entity();
    var import_table_utils = require_table_utils();
    var Schema = Symbol.for("drizzle:Schema");
    var Columns = Symbol.for("drizzle:Columns");
    var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
    var OriginalName = Symbol.for("drizzle:OriginalName");
    var BaseName = Symbol.for("drizzle:BaseName");
    var IsAlias = Symbol.for("drizzle:IsAlias");
    var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
    var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
    var Table = class {
      static [import_entity.entityKind] = "Table";
      /** @internal */
      static Symbol = {
        Name: import_table_utils.TableName,
        Schema,
        OriginalName,
        Columns,
        ExtraConfigColumns,
        BaseName,
        IsAlias,
        ExtraConfigBuilder
      };
      /**
       * @internal
       * Can be changed if the table is aliased.
       */
      [import_table_utils.TableName];
      /**
       * @internal
       * Used to store the original name of the table, before any aliasing.
       */
      [OriginalName];
      /** @internal */
      [Schema];
      /** @internal */
      [Columns];
      /** @internal */
      [ExtraConfigColumns];
      /**
       *  @internal
       * Used to store the table name before the transformation via the `tableCreator` functions.
       */
      [BaseName];
      /** @internal */
      [IsAlias] = false;
      /** @internal */
      [IsDrizzleTable] = true;
      /** @internal */
      [ExtraConfigBuilder] = void 0;
      constructor(name, schema, baseName) {
        this[import_table_utils.TableName] = this[OriginalName] = name;
        this[Schema] = schema;
        this[BaseName] = baseName;
      }
    };
    function isTable(table) {
      return typeof table === "object" && table !== null && IsDrizzleTable in table;
    }
    function getTableName(table) {
      return table[import_table_utils.TableName];
    }
    function getTableUniqueName(table) {
      return `${table[Schema] ?? "public"}.${table[import_table_utils.TableName]}`;
    }
  }
});

// node_modules/drizzle-orm/sql/sql.cjs
var require_sql = __commonJS({
  "node_modules/drizzle-orm/sql/sql.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name2 in all)
        __defProp2(target, name2, { get: all[name2], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var sql_exports = {};
    __export2(sql_exports, {
      FakePrimitiveParam: () => FakePrimitiveParam,
      Name: () => Name,
      Param: () => Param,
      Placeholder: () => Placeholder,
      SQL: () => SQL,
      StringChunk: () => StringChunk,
      View: () => View,
      fillPlaceholders: () => fillPlaceholders,
      isDriverValueEncoder: () => isDriverValueEncoder,
      isSQLWrapper: () => isSQLWrapper,
      isView: () => isView,
      name: () => name,
      noopDecoder: () => noopDecoder,
      noopEncoder: () => noopEncoder,
      noopMapper: () => noopMapper,
      param: () => param,
      placeholder: () => placeholder,
      sql: () => sql3
    });
    module.exports = __toCommonJS(sql_exports);
    var import_entity = require_entity();
    var import_enum = require_enum();
    var import_subquery = require_subquery();
    var import_tracing = require_tracing();
    var import_view_common = require_view_common();
    var import_column = require_column();
    var import_table = require_table();
    var FakePrimitiveParam = class {
      static [import_entity.entityKind] = "FakePrimitiveParam";
    };
    function isSQLWrapper(value) {
      return value !== null && value !== void 0 && typeof value.getSQL === "function";
    }
    function mergeQueries(queries) {
      const result = { sql: "", params: [] };
      for (const query of queries) {
        result.sql += query.sql;
        result.params.push(...query.params);
        if (query.typings?.length) {
          if (!result.typings) {
            result.typings = [];
          }
          result.typings.push(...query.typings);
        }
      }
      return result;
    }
    var StringChunk = class {
      static [import_entity.entityKind] = "StringChunk";
      value;
      constructor(value) {
        this.value = Array.isArray(value) ? value : [value];
      }
      getSQL() {
        return new SQL([this]);
      }
    };
    var SQL = class _SQL {
      constructor(queryChunks) {
        this.queryChunks = queryChunks;
      }
      static [import_entity.entityKind] = "SQL";
      /** @internal */
      decoder = noopDecoder;
      shouldInlineParams = false;
      append(query) {
        this.queryChunks.push(...query.queryChunks);
        return this;
      }
      toQuery(config) {
        return import_tracing.tracer.startActiveSpan("drizzle.buildSQL", (span) => {
          const query = this.buildQueryFromSourceParams(this.queryChunks, config);
          span?.setAttributes({
            "drizzle.query.text": query.sql,
            "drizzle.query.params": JSON.stringify(query.params)
          });
          return query;
        });
      }
      buildQueryFromSourceParams(chunks, _config) {
        const config = Object.assign({}, _config, {
          inlineParams: _config.inlineParams || this.shouldInlineParams,
          paramStartIndex: _config.paramStartIndex || { value: 0 }
        });
        const {
          casing,
          escapeName,
          escapeParam,
          prepareTyping,
          inlineParams,
          paramStartIndex
        } = config;
        return mergeQueries(chunks.map((chunk) => {
          if ((0, import_entity.is)(chunk, StringChunk)) {
            return { sql: chunk.value.join(""), params: [] };
          }
          if ((0, import_entity.is)(chunk, Name)) {
            return { sql: escapeName(chunk.value), params: [] };
          }
          if (chunk === void 0) {
            return { sql: "", params: [] };
          }
          if (Array.isArray(chunk)) {
            const result = [new StringChunk("(")];
            for (const [i, p] of chunk.entries()) {
              result.push(p);
              if (i < chunk.length - 1) {
                result.push(new StringChunk(", "));
              }
            }
            result.push(new StringChunk(")"));
            return this.buildQueryFromSourceParams(result, config);
          }
          if ((0, import_entity.is)(chunk, _SQL)) {
            return this.buildQueryFromSourceParams(chunk.queryChunks, {
              ...config,
              inlineParams: inlineParams || chunk.shouldInlineParams
            });
          }
          if ((0, import_entity.is)(chunk, import_table.Table)) {
            const schemaName = chunk[import_table.Table.Symbol.Schema];
            const tableName = chunk[import_table.Table.Symbol.Name];
            return {
              sql: schemaName === void 0 ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
              params: []
            };
          }
          if ((0, import_entity.is)(chunk, import_column.Column)) {
            const columnName = casing.getColumnCasing(chunk);
            if (_config.invokeSource === "indexes") {
              return { sql: escapeName(columnName), params: [] };
            }
            const schemaName = chunk.table[import_table.Table.Symbol.Schema];
            return {
              sql: chunk.table[import_table.IsAlias] || schemaName === void 0 ? escapeName(chunk.table[import_table.Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[import_table.Table.Symbol.Name]) + "." + escapeName(columnName),
              params: []
            };
          }
          if ((0, import_entity.is)(chunk, View)) {
            const schemaName = chunk[import_view_common.ViewBaseConfig].schema;
            const viewName = chunk[import_view_common.ViewBaseConfig].name;
            return {
              sql: schemaName === void 0 ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
              params: []
            };
          }
          if ((0, import_entity.is)(chunk, Param)) {
            if ((0, import_entity.is)(chunk.value, Placeholder)) {
              return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
            }
            const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
            if ((0, import_entity.is)(mappedValue, _SQL)) {
              return this.buildQueryFromSourceParams([mappedValue], config);
            }
            if (inlineParams) {
              return { sql: this.mapInlineParam(mappedValue, config), params: [] };
            }
            let typings = ["none"];
            if (prepareTyping) {
              typings = [prepareTyping(chunk.encoder)];
            }
            return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
          }
          if ((0, import_entity.is)(chunk, Placeholder)) {
            return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
          }
          if ((0, import_entity.is)(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
            return { sql: escapeName(chunk.fieldAlias), params: [] };
          }
          if ((0, import_entity.is)(chunk, import_subquery.Subquery)) {
            if (chunk._.isWith) {
              return { sql: escapeName(chunk._.alias), params: [] };
            }
            return this.buildQueryFromSourceParams([
              new StringChunk("("),
              chunk._.sql,
              new StringChunk(") "),
              new Name(chunk._.alias)
            ], config);
          }
          if ((0, import_enum.isPgEnum)(chunk)) {
            if (chunk.schema) {
              return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
            }
            return { sql: escapeName(chunk.enumName), params: [] };
          }
          if (isSQLWrapper(chunk)) {
            if (chunk.shouldOmitSQLParens?.()) {
              return this.buildQueryFromSourceParams([chunk.getSQL()], config);
            }
            return this.buildQueryFromSourceParams([
              new StringChunk("("),
              chunk.getSQL(),
              new StringChunk(")")
            ], config);
          }
          if (inlineParams) {
            return { sql: this.mapInlineParam(chunk, config), params: [] };
          }
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }));
      }
      mapInlineParam(chunk, { escapeString }) {
        if (chunk === null) {
          return "null";
        }
        if (typeof chunk === "number" || typeof chunk === "boolean") {
          return chunk.toString();
        }
        if (typeof chunk === "string") {
          return escapeString(chunk);
        }
        if (typeof chunk === "object") {
          const mappedValueAsString = chunk.toString();
          if (mappedValueAsString === "[object Object]") {
            return escapeString(JSON.stringify(chunk));
          }
          return escapeString(mappedValueAsString);
        }
        throw new Error("Unexpected param value: " + chunk);
      }
      getSQL() {
        return this;
      }
      as(alias) {
        if (alias === void 0) {
          return this;
        }
        return new _SQL.Aliased(this, alias);
      }
      mapWith(decoder) {
        this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
        return this;
      }
      inlineParams() {
        this.shouldInlineParams = true;
        return this;
      }
      /**
       * This method is used to conditionally include a part of the query.
       *
       * @param condition - Condition to check
       * @returns itself if the condition is `true`, otherwise `undefined`
       */
      if(condition) {
        return condition ? this : void 0;
      }
    };
    var Name = class {
      constructor(value) {
        this.value = value;
      }
      static [import_entity.entityKind] = "Name";
      brand;
      getSQL() {
        return new SQL([this]);
      }
    };
    function name(value) {
      return new Name(value);
    }
    function isDriverValueEncoder(value) {
      return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
    }
    var noopDecoder = {
      mapFromDriverValue: (value) => value
    };
    var noopEncoder = {
      mapToDriverValue: (value) => value
    };
    var noopMapper = {
      ...noopDecoder,
      ...noopEncoder
    };
    var Param = class {
      /**
       * @param value - Parameter value
       * @param encoder - Encoder to convert the value to a driver parameter
       */
      constructor(value, encoder = noopEncoder) {
        this.value = value;
        this.encoder = encoder;
      }
      static [import_entity.entityKind] = "Param";
      brand;
      getSQL() {
        return new SQL([this]);
      }
    };
    function param(value, encoder) {
      return new Param(value, encoder);
    }
    function sql3(strings, ...params) {
      const queryChunks = [];
      if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
        queryChunks.push(new StringChunk(strings[0]));
      }
      for (const [paramIndex, param2] of params.entries()) {
        queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
      }
      return new SQL(queryChunks);
    }
    ((sql22) => {
      function empty() {
        return new SQL([]);
      }
      sql22.empty = empty;
      function fromList(list) {
        return new SQL(list);
      }
      sql22.fromList = fromList;
      function raw(str) {
        return new SQL([new StringChunk(str)]);
      }
      sql22.raw = raw;
      function join(chunks, separator) {
        const result = [];
        for (const [i, chunk] of chunks.entries()) {
          if (i > 0 && separator !== void 0) {
            result.push(separator);
          }
          result.push(chunk);
        }
        return new SQL(result);
      }
      sql22.join = join;
      function identifier(value) {
        return new Name(value);
      }
      sql22.identifier = identifier;
      function placeholder2(name2) {
        return new Placeholder(name2);
      }
      sql22.placeholder = placeholder2;
      function param2(value, encoder) {
        return new Param(value, encoder);
      }
      sql22.param = param2;
    })(sql3 || (sql3 = {}));
    ((SQL2) => {
      class Aliased {
        constructor(sql22, fieldAlias) {
          this.sql = sql22;
          this.fieldAlias = fieldAlias;
        }
        static [import_entity.entityKind] = "SQL.Aliased";
        /** @internal */
        isSelectionField = false;
        getSQL() {
          return this.sql;
        }
        /** @internal */
        clone() {
          return new Aliased(this.sql, this.fieldAlias);
        }
      }
      SQL2.Aliased = Aliased;
    })(SQL || (SQL = {}));
    var Placeholder = class {
      constructor(name2) {
        this.name = name2;
      }
      static [import_entity.entityKind] = "Placeholder";
      getSQL() {
        return new SQL([this]);
      }
    };
    function placeholder(name2) {
      return new Placeholder(name2);
    }
    function fillPlaceholders(params, values) {
      return params.map((p) => {
        if ((0, import_entity.is)(p, Placeholder)) {
          if (!(p.name in values)) {
            throw new Error(`No value for placeholder "${p.name}" was provided`);
          }
          return values[p.name];
        }
        if ((0, import_entity.is)(p, Param) && (0, import_entity.is)(p.value, Placeholder)) {
          if (!(p.value.name in values)) {
            throw new Error(`No value for placeholder "${p.value.name}" was provided`);
          }
          return p.encoder.mapToDriverValue(values[p.value.name]);
        }
        return p;
      });
    }
    var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
    var View = class {
      static [import_entity.entityKind] = "View";
      /** @internal */
      [import_view_common.ViewBaseConfig];
      /** @internal */
      [IsDrizzleView] = true;
      constructor({ name: name2, schema, selectedFields, query }) {
        this[import_view_common.ViewBaseConfig] = {
          name: name2,
          originalName: name2,
          schema,
          selectedFields,
          query,
          isExisting: !query,
          isAlias: false
        };
      }
      getSQL() {
        return new SQL([this]);
      }
    };
    function isView(view) {
      return typeof view === "object" && view !== null && IsDrizzleView in view;
    }
    import_column.Column.prototype.getSQL = function() {
      return new SQL([this]);
    };
    import_table.Table.prototype.getSQL = function() {
      return new SQL([this]);
    };
    import_subquery.Subquery.prototype.getSQL = function() {
      return new SQL([this]);
    };
  }
});

// node_modules/drizzle-orm/alias.cjs
var require_alias = __commonJS({
  "node_modules/drizzle-orm/alias.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var alias_exports = {};
    __export2(alias_exports, {
      ColumnAliasProxyHandler: () => ColumnAliasProxyHandler,
      RelationTableAliasProxyHandler: () => RelationTableAliasProxyHandler,
      TableAliasProxyHandler: () => TableAliasProxyHandler,
      aliasedRelation: () => aliasedRelation,
      aliasedTable: () => aliasedTable,
      aliasedTableColumn: () => aliasedTableColumn,
      mapColumnsInAliasedSQLToAlias: () => mapColumnsInAliasedSQLToAlias,
      mapColumnsInSQLToAlias: () => mapColumnsInSQLToAlias
    });
    module.exports = __toCommonJS(alias_exports);
    var import_column = require_column();
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_table = require_table();
    var import_view_common = require_view_common();
    var ColumnAliasProxyHandler = class {
      constructor(table) {
        this.table = table;
      }
      static [import_entity.entityKind] = "ColumnAliasProxyHandler";
      get(columnObj, prop) {
        if (prop === "table") {
          return this.table;
        }
        return columnObj[prop];
      }
    };
    var TableAliasProxyHandler = class {
      constructor(alias, replaceOriginalName) {
        this.alias = alias;
        this.replaceOriginalName = replaceOriginalName;
      }
      static [import_entity.entityKind] = "TableAliasProxyHandler";
      get(target, prop) {
        if (prop === import_table.Table.Symbol.IsAlias) {
          return true;
        }
        if (prop === import_table.Table.Symbol.Name) {
          return this.alias;
        }
        if (this.replaceOriginalName && prop === import_table.Table.Symbol.OriginalName) {
          return this.alias;
        }
        if (prop === import_view_common.ViewBaseConfig) {
          return {
            ...target[import_view_common.ViewBaseConfig],
            name: this.alias,
            isAlias: true
          };
        }
        if (prop === import_table.Table.Symbol.Columns) {
          const columns = target[import_table.Table.Symbol.Columns];
          if (!columns) {
            return columns;
          }
          const proxiedColumns = {};
          Object.keys(columns).map((key) => {
            proxiedColumns[key] = new Proxy(
              columns[key],
              new ColumnAliasProxyHandler(new Proxy(target, this))
            );
          });
          return proxiedColumns;
        }
        const value = target[prop];
        if ((0, import_entity.is)(value, import_column.Column)) {
          return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
        }
        return value;
      }
    };
    var RelationTableAliasProxyHandler = class {
      constructor(alias) {
        this.alias = alias;
      }
      static [import_entity.entityKind] = "RelationTableAliasProxyHandler";
      get(target, prop) {
        if (prop === "sourceTable") {
          return aliasedTable(target.sourceTable, this.alias);
        }
        return target[prop];
      }
    };
    function aliasedTable(table, tableAlias) {
      return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
    }
    function aliasedRelation(relation, tableAlias) {
      return new Proxy(relation, new RelationTableAliasProxyHandler(tableAlias));
    }
    function aliasedTableColumn(column, tableAlias) {
      return new Proxy(
        column,
        new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
      );
    }
    function mapColumnsInAliasedSQLToAlias(query, alias) {
      return new import_sql.SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
    }
    function mapColumnsInSQLToAlias(query, alias) {
      return import_sql.sql.join(query.queryChunks.map((c) => {
        if ((0, import_entity.is)(c, import_column.Column)) {
          return aliasedTableColumn(c, alias);
        }
        if ((0, import_entity.is)(c, import_sql.SQL)) {
          return mapColumnsInSQLToAlias(c, alias);
        }
        if ((0, import_entity.is)(c, import_sql.SQL.Aliased)) {
          return mapColumnsInAliasedSQLToAlias(c, alias);
        }
        return c;
      }));
    }
  }
});

// node_modules/drizzle-orm/errors.cjs
var require_errors = __commonJS({
  "node_modules/drizzle-orm/errors.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var errors_exports = {};
    __export2(errors_exports, {
      DrizzleError: () => DrizzleError,
      TransactionRollbackError: () => TransactionRollbackError
    });
    module.exports = __toCommonJS(errors_exports);
    var import_entity = require_entity();
    var DrizzleError = class extends Error {
      static [import_entity.entityKind] = "DrizzleError";
      constructor({ message, cause }) {
        super(message);
        this.name = "DrizzleError";
        this.cause = cause;
      }
    };
    var TransactionRollbackError = class extends DrizzleError {
      static [import_entity.entityKind] = "TransactionRollbackError";
      constructor() {
        super({ message: "Rollback" });
      }
    };
  }
});

// node_modules/drizzle-orm/sql/expressions/conditions.cjs
var require_conditions = __commonJS({
  "node_modules/drizzle-orm/sql/expressions/conditions.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var conditions_exports = {};
    __export2(conditions_exports, {
      and: () => and2,
      arrayContained: () => arrayContained,
      arrayContains: () => arrayContains,
      arrayOverlaps: () => arrayOverlaps,
      between: () => between,
      bindIfParam: () => bindIfParam,
      eq: () => eq3,
      exists: () => exists,
      gt: () => gt,
      gte: () => gte,
      ilike: () => ilike,
      inArray: () => inArray,
      isNotNull: () => isNotNull,
      isNull: () => isNull,
      like: () => like2,
      lt: () => lt,
      lte: () => lte,
      ne: () => ne,
      not: () => not,
      notBetween: () => notBetween,
      notExists: () => notExists,
      notIlike: () => notIlike,
      notInArray: () => notInArray,
      notLike: () => notLike,
      or: () => or
    });
    module.exports = __toCommonJS(conditions_exports);
    var import_column = require_column();
    var import_entity = require_entity();
    var import_table = require_table();
    var import_sql = require_sql();
    function bindIfParam(value, column) {
      if ((0, import_sql.isDriverValueEncoder)(column) && !(0, import_sql.isSQLWrapper)(value) && !(0, import_entity.is)(value, import_sql.Param) && !(0, import_entity.is)(value, import_sql.Placeholder) && !(0, import_entity.is)(value, import_column.Column) && !(0, import_entity.is)(value, import_table.Table) && !(0, import_entity.is)(value, import_sql.View)) {
        return new import_sql.Param(value, column);
      }
      return value;
    }
    var eq3 = (left, right) => {
      return import_sql.sql`${left} = ${bindIfParam(right, left)}`;
    };
    var ne = (left, right) => {
      return import_sql.sql`${left} <> ${bindIfParam(right, left)}`;
    };
    function and2(...unfilteredConditions) {
      const conditions = unfilteredConditions.filter(
        (c) => c !== void 0
      );
      if (conditions.length === 0) {
        return void 0;
      }
      if (conditions.length === 1) {
        return new import_sql.SQL(conditions);
      }
      return new import_sql.SQL([
        new import_sql.StringChunk("("),
        import_sql.sql.join(conditions, new import_sql.StringChunk(" and ")),
        new import_sql.StringChunk(")")
      ]);
    }
    function or(...unfilteredConditions) {
      const conditions = unfilteredConditions.filter(
        (c) => c !== void 0
      );
      if (conditions.length === 0) {
        return void 0;
      }
      if (conditions.length === 1) {
        return new import_sql.SQL(conditions);
      }
      return new import_sql.SQL([
        new import_sql.StringChunk("("),
        import_sql.sql.join(conditions, new import_sql.StringChunk(" or ")),
        new import_sql.StringChunk(")")
      ]);
    }
    function not(condition) {
      return import_sql.sql`not ${condition}`;
    }
    var gt = (left, right) => {
      return import_sql.sql`${left} > ${bindIfParam(right, left)}`;
    };
    var gte = (left, right) => {
      return import_sql.sql`${left} >= ${bindIfParam(right, left)}`;
    };
    var lt = (left, right) => {
      return import_sql.sql`${left} < ${bindIfParam(right, left)}`;
    };
    var lte = (left, right) => {
      return import_sql.sql`${left} <= ${bindIfParam(right, left)}`;
    };
    function inArray(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          return import_sql.sql`false`;
        }
        return import_sql.sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
      }
      return import_sql.sql`${column} in ${bindIfParam(values, column)}`;
    }
    function notInArray(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          return import_sql.sql`true`;
        }
        return import_sql.sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
      }
      return import_sql.sql`${column} not in ${bindIfParam(values, column)}`;
    }
    function isNull(value) {
      return import_sql.sql`${value} is null`;
    }
    function isNotNull(value) {
      return import_sql.sql`${value} is not null`;
    }
    function exists(subquery) {
      return import_sql.sql`exists ${subquery}`;
    }
    function notExists(subquery) {
      return import_sql.sql`not exists ${subquery}`;
    }
    function between(column, min, max) {
      return import_sql.sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
        max,
        column
      )}`;
    }
    function notBetween(column, min, max) {
      return import_sql.sql`${column} not between ${bindIfParam(
        min,
        column
      )} and ${bindIfParam(max, column)}`;
    }
    function like2(column, value) {
      return import_sql.sql`${column} like ${value}`;
    }
    function notLike(column, value) {
      return import_sql.sql`${column} not like ${value}`;
    }
    function ilike(column, value) {
      return import_sql.sql`${column} ilike ${value}`;
    }
    function notIlike(column, value) {
      return import_sql.sql`${column} not ilike ${value}`;
    }
    function arrayContains(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          throw new Error("arrayContains requires at least one value");
        }
        const array = import_sql.sql`${bindIfParam(values, column)}`;
        return import_sql.sql`${column} @> ${array}`;
      }
      return import_sql.sql`${column} @> ${bindIfParam(values, column)}`;
    }
    function arrayContained(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          throw new Error("arrayContained requires at least one value");
        }
        const array = import_sql.sql`${bindIfParam(values, column)}`;
        return import_sql.sql`${column} <@ ${array}`;
      }
      return import_sql.sql`${column} <@ ${bindIfParam(values, column)}`;
    }
    function arrayOverlaps(column, values) {
      if (Array.isArray(values)) {
        if (values.length === 0) {
          throw new Error("arrayOverlaps requires at least one value");
        }
        const array = import_sql.sql`${bindIfParam(values, column)}`;
        return import_sql.sql`${column} && ${array}`;
      }
      return import_sql.sql`${column} && ${bindIfParam(values, column)}`;
    }
  }
});

// node_modules/drizzle-orm/sql/expressions/select.cjs
var require_select = __commonJS({
  "node_modules/drizzle-orm/sql/expressions/select.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc22) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc22 = __getOwnPropDesc2(from, key)) || desc22.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var select_exports = {};
    __export2(select_exports, {
      asc: () => asc,
      desc: () => desc2
    });
    module.exports = __toCommonJS(select_exports);
    var import_sql = require_sql();
    function asc(column) {
      return import_sql.sql`${column} asc`;
    }
    function desc2(column) {
      return import_sql.sql`${column} desc`;
    }
  }
});

// node_modules/drizzle-orm/sql/expressions/index.cjs
var require_expressions = __commonJS({
  "node_modules/drizzle-orm/sql/expressions/index.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps2(target, mod, "default"), secondTarget && __copyProps2(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var expressions_exports = {};
    module.exports = __toCommonJS(expressions_exports);
    __reExport(expressions_exports, require_conditions(), module.exports);
    __reExport(expressions_exports, require_select(), module.exports);
  }
});

// node_modules/drizzle-orm/expressions.cjs
var require_expressions2 = __commonJS({
  "node_modules/drizzle-orm/expressions.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps2(target, mod, "default"), secondTarget && __copyProps2(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var expressions_exports = {};
    module.exports = __toCommonJS(expressions_exports);
    __reExport(expressions_exports, require_expressions(), module.exports);
  }
});

// node_modules/drizzle-orm/logger.cjs
var require_logger = __commonJS({
  "node_modules/drizzle-orm/logger.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var logger_exports = {};
    __export2(logger_exports, {
      ConsoleLogWriter: () => ConsoleLogWriter,
      DefaultLogger: () => DefaultLogger,
      NoopLogger: () => NoopLogger
    });
    module.exports = __toCommonJS(logger_exports);
    var import_entity = require_entity();
    var ConsoleLogWriter = class {
      static [import_entity.entityKind] = "ConsoleLogWriter";
      write(message) {
        console.log(message);
      }
    };
    var DefaultLogger = class {
      static [import_entity.entityKind] = "DefaultLogger";
      writer;
      constructor(config) {
        this.writer = config?.writer ?? new ConsoleLogWriter();
      }
      logQuery(query, params) {
        const stringifiedParams = params.map((p) => {
          try {
            return JSON.stringify(p);
          } catch {
            return String(p);
          }
        });
        const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
        this.writer.write(`Query: ${query}${paramsStr}`);
      }
    };
    var NoopLogger = class {
      static [import_entity.entityKind] = "NoopLogger";
      logQuery() {
      }
    };
  }
});

// node_modules/drizzle-orm/operations.cjs
var require_operations = __commonJS({
  "node_modules/drizzle-orm/operations.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var operations_exports = {};
    module.exports = __toCommonJS(operations_exports);
  }
});

// node_modules/drizzle-orm/query-promise.cjs
var require_query_promise = __commonJS({
  "node_modules/drizzle-orm/query-promise.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var query_promise_exports = {};
    __export2(query_promise_exports, {
      QueryPromise: () => QueryPromise
    });
    module.exports = __toCommonJS(query_promise_exports);
    var import_entity = require_entity();
    var QueryPromise = class {
      static [import_entity.entityKind] = "QueryPromise";
      [Symbol.toStringTag] = "QueryPromise";
      catch(onRejected) {
        return this.then(void 0, onRejected);
      }
      finally(onFinally) {
        return this.then(
          (value) => {
            onFinally?.();
            return value;
          },
          (reason) => {
            onFinally?.();
            throw reason;
          }
        );
      }
      then(onFulfilled, onRejected) {
        return this.execute().then(onFulfilled, onRejected);
      }
    };
  }
});

// node_modules/drizzle-orm/utils.cjs
var require_utils = __commonJS({
  "node_modules/drizzle-orm/utils.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    __export2(utils_exports, {
      applyMixins: () => applyMixins,
      getColumnNameAndConfig: () => getColumnNameAndConfig,
      getTableColumns: () => getTableColumns,
      getTableLikeName: () => getTableLikeName,
      getViewSelectedFields: () => getViewSelectedFields,
      haveSameKeys: () => haveSameKeys,
      isConfig: () => isConfig,
      mapResultRow: () => mapResultRow,
      mapUpdateSet: () => mapUpdateSet,
      orderSelectedFields: () => orderSelectedFields
    });
    module.exports = __toCommonJS(utils_exports);
    var import_column = require_column();
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_subquery = require_subquery();
    var import_table = require_table();
    var import_view_common = require_view_common();
    function mapResultRow(columns, row, joinsNotNullableMap) {
      const nullifyMap = {};
      const result = columns.reduce(
        (result2, { path: path4, field }, columnIndex) => {
          let decoder;
          if ((0, import_entity.is)(field, import_column.Column)) {
            decoder = field;
          } else if ((0, import_entity.is)(field, import_sql.SQL)) {
            decoder = field.decoder;
          } else {
            decoder = field.sql.decoder;
          }
          let node = result2;
          for (const [pathChunkIndex, pathChunk] of path4.entries()) {
            if (pathChunkIndex < path4.length - 1) {
              if (!(pathChunk in node)) {
                node[pathChunk] = {};
              }
              node = node[pathChunk];
            } else {
              const rawValue = row[columnIndex];
              const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
              if (joinsNotNullableMap && (0, import_entity.is)(field, import_column.Column) && path4.length === 2) {
                const objectName = path4[0];
                if (!(objectName in nullifyMap)) {
                  nullifyMap[objectName] = value === null ? (0, import_table.getTableName)(field.table) : false;
                } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== (0, import_table.getTableName)(field.table)) {
                  nullifyMap[objectName] = false;
                }
              }
            }
          }
          return result2;
        },
        {}
      );
      if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
        for (const [objectName, tableName] of Object.entries(nullifyMap)) {
          if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
            result[objectName] = null;
          }
        }
      }
      return result;
    }
    function orderSelectedFields(fields, pathPrefix) {
      return Object.entries(fields).reduce((result, [name, field]) => {
        if (typeof name !== "string") {
          return result;
        }
        const newPath = pathPrefix ? [...pathPrefix, name] : [name];
        if ((0, import_entity.is)(field, import_column.Column) || (0, import_entity.is)(field, import_sql.SQL) || (0, import_entity.is)(field, import_sql.SQL.Aliased)) {
          result.push({ path: newPath, field });
        } else if ((0, import_entity.is)(field, import_table.Table)) {
          result.push(...orderSelectedFields(field[import_table.Table.Symbol.Columns], newPath));
        } else {
          result.push(...orderSelectedFields(field, newPath));
        }
        return result;
      }, []);
    }
    function haveSameKeys(left, right) {
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      if (leftKeys.length !== rightKeys.length) {
        return false;
      }
      for (const [index, key] of leftKeys.entries()) {
        if (key !== rightKeys[index]) {
          return false;
        }
      }
      return true;
    }
    function mapUpdateSet(table, values) {
      const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
        if ((0, import_entity.is)(value, import_sql.SQL) || (0, import_entity.is)(value, import_column.Column)) {
          return [key, value];
        } else {
          return [key, new import_sql.Param(value, table[import_table.Table.Symbol.Columns][key])];
        }
      });
      if (entries.length === 0) {
        throw new Error("No values to set");
      }
      return Object.fromEntries(entries);
    }
    function applyMixins(baseClass, extendedClasses) {
      for (const extendedClass of extendedClasses) {
        for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
          if (name === "constructor")
            continue;
          Object.defineProperty(
            baseClass.prototype,
            name,
            Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
          );
        }
      }
    }
    function getTableColumns(table) {
      return table[import_table.Table.Symbol.Columns];
    }
    function getViewSelectedFields(view) {
      return view[import_view_common.ViewBaseConfig].selectedFields;
    }
    function getTableLikeName(table) {
      return (0, import_entity.is)(table, import_subquery.Subquery) ? table._.alias : (0, import_entity.is)(table, import_sql.View) ? table[import_view_common.ViewBaseConfig].name : (0, import_entity.is)(table, import_sql.SQL) ? void 0 : table[import_table.Table.Symbol.IsAlias] ? table[import_table.Table.Symbol.Name] : table[import_table.Table.Symbol.BaseName];
    }
    function getColumnNameAndConfig(a, b) {
      return {
        name: typeof a === "string" && a.length > 0 ? a : "",
        config: typeof a === "object" ? a : b
      };
    }
    function isConfig(data) {
      if (typeof data !== "object" || data === null)
        return false;
      if (data.constructor.name !== "Object")
        return false;
      if ("logger" in data) {
        const type = typeof data["logger"];
        if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined")
          return false;
        return true;
      }
      if ("schema" in data) {
        const type = typeof data["logger"];
        if (type !== "object" && type !== "undefined")
          return false;
        return true;
      }
      if ("casing" in data) {
        const type = typeof data["logger"];
        if (type !== "string" && type !== "undefined")
          return false;
        return true;
      }
      if ("mode" in data) {
        if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0)
          return false;
        return true;
      }
      if ("connection" in data) {
        const type = typeof data["connection"];
        if (type !== "string" && type !== "object" && type !== "undefined")
          return false;
        return true;
      }
      if ("client" in data) {
        const type = typeof data["client"];
        if (type !== "object" && type !== "function" && type !== "undefined")
          return false;
        return true;
      }
      if (Object.keys(data).length === 0)
        return true;
      return false;
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/int.common.cjs
var require_int_common = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/int.common.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var int_common_exports = {};
    __export2(int_common_exports, {
      PgIntColumnBaseBuilder: () => PgIntColumnBaseBuilder
    });
    module.exports = __toCommonJS(int_common_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgIntColumnBaseBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgIntColumnBaseBuilder";
      generatedAlwaysAsIdentity(sequence) {
        if (sequence) {
          const { name, ...options } = sequence;
          this.config.generatedIdentity = {
            type: "always",
            sequenceName: name,
            sequenceOptions: options
          };
        } else {
          this.config.generatedIdentity = {
            type: "always"
          };
        }
        this.config.hasDefault = true;
        this.config.notNull = true;
        return this;
      }
      generatedByDefaultAsIdentity(sequence) {
        if (sequence) {
          const { name, ...options } = sequence;
          this.config.generatedIdentity = {
            type: "byDefault",
            sequenceName: name,
            sequenceOptions: options
          };
        } else {
          this.config.generatedIdentity = {
            type: "byDefault"
          };
        }
        this.config.hasDefault = true;
        this.config.notNull = true;
        return this;
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/bigint.cjs
var require_bigint = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/bigint.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var bigint_exports = {};
    __export2(bigint_exports, {
      PgBigInt53: () => PgBigInt53,
      PgBigInt53Builder: () => PgBigInt53Builder,
      PgBigInt64: () => PgBigInt64,
      PgBigInt64Builder: () => PgBigInt64Builder,
      bigint: () => bigint
    });
    module.exports = __toCommonJS(bigint_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_int_common = require_int_common();
    var PgBigInt53Builder = class extends import_int_common.PgIntColumnBaseBuilder {
      static [import_entity.entityKind] = "PgBigInt53Builder";
      constructor(name) {
        super(name, "number", "PgBigInt53");
      }
      /** @internal */
      build(table) {
        return new PgBigInt53(table, this.config);
      }
    };
    var PgBigInt53 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBigInt53";
      getSQLType() {
        return "bigint";
      }
      mapFromDriverValue(value) {
        if (typeof value === "number") {
          return value;
        }
        return Number(value);
      }
    };
    var PgBigInt64Builder = class extends import_int_common.PgIntColumnBaseBuilder {
      static [import_entity.entityKind] = "PgBigInt64Builder";
      constructor(name) {
        super(name, "bigint", "PgBigInt64");
      }
      /** @internal */
      build(table) {
        return new PgBigInt64(
          table,
          this.config
        );
      }
    };
    var PgBigInt64 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBigInt64";
      getSQLType() {
        return "bigint";
      }
      // eslint-disable-next-line unicorn/prefer-native-coercion-functions
      mapFromDriverValue(value) {
        return BigInt(value);
      }
    };
    function bigint(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config.mode === "number") {
        return new PgBigInt53Builder(name);
      }
      return new PgBigInt64Builder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/bigserial.cjs
var require_bigserial = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/bigserial.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var bigserial_exports = {};
    __export2(bigserial_exports, {
      PgBigSerial53: () => PgBigSerial53,
      PgBigSerial53Builder: () => PgBigSerial53Builder,
      PgBigSerial64: () => PgBigSerial64,
      PgBigSerial64Builder: () => PgBigSerial64Builder,
      bigserial: () => bigserial
    });
    module.exports = __toCommonJS(bigserial_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgBigSerial53Builder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgBigSerial53Builder";
      constructor(name) {
        super(name, "number", "PgBigSerial53");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgBigSerial53(
          table,
          this.config
        );
      }
    };
    var PgBigSerial53 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBigSerial53";
      getSQLType() {
        return "bigserial";
      }
      mapFromDriverValue(value) {
        if (typeof value === "number") {
          return value;
        }
        return Number(value);
      }
    };
    var PgBigSerial64Builder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgBigSerial64Builder";
      constructor(name) {
        super(name, "bigint", "PgBigSerial64");
        this.config.hasDefault = true;
      }
      /** @internal */
      build(table) {
        return new PgBigSerial64(
          table,
          this.config
        );
      }
    };
    var PgBigSerial64 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBigSerial64";
      getSQLType() {
        return "bigserial";
      }
      // eslint-disable-next-line unicorn/prefer-native-coercion-functions
      mapFromDriverValue(value) {
        return BigInt(value);
      }
    };
    function bigserial(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config.mode === "number") {
        return new PgBigSerial53Builder(name);
      }
      return new PgBigSerial64Builder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/boolean.cjs
var require_boolean = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/boolean.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var boolean_exports = {};
    __export2(boolean_exports, {
      PgBoolean: () => PgBoolean,
      PgBooleanBuilder: () => PgBooleanBuilder,
      boolean: () => boolean2
    });
    module.exports = __toCommonJS(boolean_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgBooleanBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgBooleanBuilder";
      constructor(name) {
        super(name, "boolean", "PgBoolean");
      }
      /** @internal */
      build(table) {
        return new PgBoolean(table, this.config);
      }
    };
    var PgBoolean = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBoolean";
      getSQLType() {
        return "boolean";
      }
    };
    function boolean2(name) {
      return new PgBooleanBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/char.cjs
var require_char = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/char.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var char_exports = {};
    __export2(char_exports, {
      PgChar: () => PgChar,
      PgCharBuilder: () => PgCharBuilder,
      char: () => char
    });
    module.exports = __toCommonJS(char_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgCharBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgCharBuilder";
      constructor(name, config) {
        super(name, "string", "PgChar");
        this.config.length = config.length;
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgChar(
          table,
          this.config
        );
      }
    };
    var PgChar = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgChar";
      length = this.config.length;
      enumValues = this.config.enumValues;
      getSQLType() {
        return this.length === void 0 ? `char` : `char(${this.length})`;
      }
    };
    function char(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgCharBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/cidr.cjs
var require_cidr = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/cidr.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var cidr_exports = {};
    __export2(cidr_exports, {
      PgCidr: () => PgCidr,
      PgCidrBuilder: () => PgCidrBuilder,
      cidr: () => cidr
    });
    module.exports = __toCommonJS(cidr_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgCidrBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgCidrBuilder";
      constructor(name) {
        super(name, "string", "PgCidr");
      }
      /** @internal */
      build(table) {
        return new PgCidr(table, this.config);
      }
    };
    var PgCidr = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgCidr";
      getSQLType() {
        return "cidr";
      }
    };
    function cidr(name) {
      return new PgCidrBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/custom.cjs
var require_custom = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/custom.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var custom_exports = {};
    __export2(custom_exports, {
      PgCustomColumn: () => PgCustomColumn,
      PgCustomColumnBuilder: () => PgCustomColumnBuilder,
      customType: () => customType
    });
    module.exports = __toCommonJS(custom_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgCustomColumnBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgCustomColumnBuilder";
      constructor(name, fieldConfig, customTypeParams) {
        super(name, "custom", "PgCustomColumn");
        this.config.fieldConfig = fieldConfig;
        this.config.customTypeParams = customTypeParams;
      }
      /** @internal */
      build(table) {
        return new PgCustomColumn(
          table,
          this.config
        );
      }
    };
    var PgCustomColumn = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgCustomColumn";
      sqlName;
      mapTo;
      mapFrom;
      constructor(table, config) {
        super(table, config);
        this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
        this.mapTo = config.customTypeParams.toDriver;
        this.mapFrom = config.customTypeParams.fromDriver;
      }
      getSQLType() {
        return this.sqlName;
      }
      mapFromDriverValue(value) {
        return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
      }
      mapToDriverValue(value) {
        return typeof this.mapTo === "function" ? this.mapTo(value) : value;
      }
    };
    function customType(customTypeParams) {
      return (a, b) => {
        const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
        return new PgCustomColumnBuilder(name, config, customTypeParams);
      };
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/date.common.cjs
var require_date_common = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/date.common.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var date_common_exports = {};
    __export2(date_common_exports, {
      PgDateColumnBaseBuilder: () => PgDateColumnBaseBuilder
    });
    module.exports = __toCommonJS(date_common_exports);
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_common = require_common();
    var PgDateColumnBaseBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgDateColumnBaseBuilder";
      defaultNow() {
        return this.default(import_sql.sql`now()`);
      }
    };
  }
});

// node_modules/drizzle-orm/pg-core/columns/date.cjs
var require_date = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/date.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var date_exports = {};
    __export2(date_exports, {
      PgDate: () => PgDate,
      PgDateBuilder: () => PgDateBuilder,
      PgDateString: () => PgDateString,
      PgDateStringBuilder: () => PgDateStringBuilder,
      date: () => date
    });
    module.exports = __toCommonJS(date_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_date_common = require_date_common();
    var PgDateBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      static [import_entity.entityKind] = "PgDateBuilder";
      constructor(name) {
        super(name, "date", "PgDate");
      }
      /** @internal */
      build(table) {
        return new PgDate(table, this.config);
      }
    };
    var PgDate = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgDate";
      getSQLType() {
        return "date";
      }
      mapFromDriverValue(value) {
        return new Date(value);
      }
      mapToDriverValue(value) {
        return value.toISOString();
      }
    };
    var PgDateStringBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      static [import_entity.entityKind] = "PgDateStringBuilder";
      constructor(name) {
        super(name, "string", "PgDateString");
      }
      /** @internal */
      build(table) {
        return new PgDateString(
          table,
          this.config
        );
      }
    };
    var PgDateString = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgDateString";
      getSQLType() {
        return "date";
      }
    };
    function date(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config?.mode === "date") {
        return new PgDateBuilder(name);
      }
      return new PgDateStringBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/double-precision.cjs
var require_double_precision = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/double-precision.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var double_precision_exports = {};
    __export2(double_precision_exports, {
      PgDoublePrecision: () => PgDoublePrecision,
      PgDoublePrecisionBuilder: () => PgDoublePrecisionBuilder,
      doublePrecision: () => doublePrecision
    });
    module.exports = __toCommonJS(double_precision_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgDoublePrecisionBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgDoublePrecisionBuilder";
      constructor(name) {
        super(name, "number", "PgDoublePrecision");
      }
      /** @internal */
      build(table) {
        return new PgDoublePrecision(
          table,
          this.config
        );
      }
    };
    var PgDoublePrecision = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgDoublePrecision";
      getSQLType() {
        return "double precision";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          return Number.parseFloat(value);
        }
        return value;
      }
    };
    function doublePrecision(name) {
      return new PgDoublePrecisionBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/inet.cjs
var require_inet = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/inet.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var inet_exports = {};
    __export2(inet_exports, {
      PgInet: () => PgInet,
      PgInetBuilder: () => PgInetBuilder,
      inet: () => inet
    });
    module.exports = __toCommonJS(inet_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgInetBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgInetBuilder";
      constructor(name) {
        super(name, "string", "PgInet");
      }
      /** @internal */
      build(table) {
        return new PgInet(table, this.config);
      }
    };
    var PgInet = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgInet";
      getSQLType() {
        return "inet";
      }
    };
    function inet(name) {
      return new PgInetBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/integer.cjs
var require_integer = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/integer.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var integer_exports = {};
    __export2(integer_exports, {
      PgInteger: () => PgInteger,
      PgIntegerBuilder: () => PgIntegerBuilder,
      integer: () => integer2
    });
    module.exports = __toCommonJS(integer_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var import_int_common = require_int_common();
    var PgIntegerBuilder = class extends import_int_common.PgIntColumnBaseBuilder {
      static [import_entity.entityKind] = "PgIntegerBuilder";
      constructor(name) {
        super(name, "number", "PgInteger");
      }
      /** @internal */
      build(table) {
        return new PgInteger(table, this.config);
      }
    };
    var PgInteger = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgInteger";
      getSQLType() {
        return "integer";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          return Number.parseInt(value);
        }
        return value;
      }
    };
    function integer2(name) {
      return new PgIntegerBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/interval.cjs
var require_interval = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/interval.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var interval_exports = {};
    __export2(interval_exports, {
      PgInterval: () => PgInterval,
      PgIntervalBuilder: () => PgIntervalBuilder,
      interval: () => interval
    });
    module.exports = __toCommonJS(interval_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgIntervalBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgIntervalBuilder";
      constructor(name, intervalConfig) {
        super(name, "string", "PgInterval");
        this.config.intervalConfig = intervalConfig;
      }
      /** @internal */
      build(table) {
        return new PgInterval(table, this.config);
      }
    };
    var PgInterval = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgInterval";
      fields = this.config.intervalConfig.fields;
      precision = this.config.intervalConfig.precision;
      getSQLType() {
        const fields = this.fields ? ` ${this.fields}` : "";
        const precision = this.precision ? `(${this.precision})` : "";
        return `interval${fields}${precision}`;
      }
    };
    function interval(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgIntervalBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/json.cjs
var require_json = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/json.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var json_exports = {};
    __export2(json_exports, {
      PgJson: () => PgJson,
      PgJsonBuilder: () => PgJsonBuilder,
      json: () => json
    });
    module.exports = __toCommonJS(json_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgJsonBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgJsonBuilder";
      constructor(name) {
        super(name, "json", "PgJson");
      }
      /** @internal */
      build(table) {
        return new PgJson(table, this.config);
      }
    };
    var PgJson = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgJson";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "json";
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    };
    function json(name) {
      return new PgJsonBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/jsonb.cjs
var require_jsonb = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/jsonb.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var jsonb_exports = {};
    __export2(jsonb_exports, {
      PgJsonb: () => PgJsonb,
      PgJsonbBuilder: () => PgJsonbBuilder,
      jsonb: () => jsonb2
    });
    module.exports = __toCommonJS(jsonb_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgJsonbBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgJsonbBuilder";
      constructor(name) {
        super(name, "json", "PgJsonb");
      }
      /** @internal */
      build(table) {
        return new PgJsonb(table, this.config);
      }
    };
    var PgJsonb = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgJsonb";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "jsonb";
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }
    };
    function jsonb2(name) {
      return new PgJsonbBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/line.cjs
var require_line = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/line.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var line_exports = {};
    __export2(line_exports, {
      PgLineABC: () => PgLineABC,
      PgLineABCBuilder: () => PgLineABCBuilder,
      PgLineBuilder: () => PgLineBuilder,
      PgLineTuple: () => PgLineTuple,
      line: () => line
    });
    module.exports = __toCommonJS(line_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgLineBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgLineBuilder";
      constructor(name) {
        super(name, "array", "PgLine");
      }
      /** @internal */
      build(table) {
        return new PgLineTuple(
          table,
          this.config
        );
      }
    };
    var PgLineTuple = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgLine";
      getSQLType() {
        return "line";
      }
      mapFromDriverValue(value) {
        const [a, b, c] = value.slice(1, -1).split(",");
        return [Number.parseFloat(a), Number.parseFloat(b), Number.parseFloat(c)];
      }
      mapToDriverValue(value) {
        return `{${value[0]},${value[1]},${value[2]}}`;
      }
    };
    var PgLineABCBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgLineABCBuilder";
      constructor(name) {
        super(name, "json", "PgLineABC");
      }
      /** @internal */
      build(table) {
        return new PgLineABC(
          table,
          this.config
        );
      }
    };
    var PgLineABC = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgLineABC";
      getSQLType() {
        return "line";
      }
      mapFromDriverValue(value) {
        const [a, b, c] = value.slice(1, -1).split(",");
        return { a: Number.parseFloat(a), b: Number.parseFloat(b), c: Number.parseFloat(c) };
      }
      mapToDriverValue(value) {
        return `{${value.a},${value.b},${value.c}}`;
      }
    };
    function line(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (!config?.mode || config.mode === "tuple") {
        return new PgLineBuilder(name);
      }
      return new PgLineABCBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/macaddr.cjs
var require_macaddr = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/macaddr.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var macaddr_exports = {};
    __export2(macaddr_exports, {
      PgMacaddr: () => PgMacaddr,
      PgMacaddrBuilder: () => PgMacaddrBuilder,
      macaddr: () => macaddr
    });
    module.exports = __toCommonJS(macaddr_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgMacaddrBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgMacaddrBuilder";
      constructor(name) {
        super(name, "string", "PgMacaddr");
      }
      /** @internal */
      build(table) {
        return new PgMacaddr(table, this.config);
      }
    };
    var PgMacaddr = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgMacaddr";
      getSQLType() {
        return "macaddr";
      }
    };
    function macaddr(name) {
      return new PgMacaddrBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/macaddr8.cjs
var require_macaddr8 = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/macaddr8.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var macaddr8_exports = {};
    __export2(macaddr8_exports, {
      PgMacaddr8: () => PgMacaddr8,
      PgMacaddr8Builder: () => PgMacaddr8Builder,
      macaddr8: () => macaddr8
    });
    module.exports = __toCommonJS(macaddr8_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgMacaddr8Builder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgMacaddr8Builder";
      constructor(name) {
        super(name, "string", "PgMacaddr8");
      }
      /** @internal */
      build(table) {
        return new PgMacaddr8(table, this.config);
      }
    };
    var PgMacaddr8 = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgMacaddr8";
      getSQLType() {
        return "macaddr8";
      }
    };
    function macaddr8(name) {
      return new PgMacaddr8Builder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/numeric.cjs
var require_numeric = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/numeric.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var numeric_exports = {};
    __export2(numeric_exports, {
      PgNumeric: () => PgNumeric,
      PgNumericBuilder: () => PgNumericBuilder,
      decimal: () => decimal2,
      numeric: () => numeric
    });
    module.exports = __toCommonJS(numeric_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgNumericBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgNumericBuilder";
      constructor(name, precision, scale) {
        super(name, "string", "PgNumeric");
        this.config.precision = precision;
        this.config.scale = scale;
      }
      /** @internal */
      build(table) {
        return new PgNumeric(table, this.config);
      }
    };
    var PgNumeric = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgNumeric";
      precision;
      scale;
      constructor(table, config) {
        super(table, config);
        this.precision = config.precision;
        this.scale = config.scale;
      }
      getSQLType() {
        if (this.precision !== void 0 && this.scale !== void 0) {
          return `numeric(${this.precision}, ${this.scale})`;
        } else if (this.precision === void 0) {
          return "numeric";
        } else {
          return `numeric(${this.precision})`;
        }
      }
    };
    function numeric(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgNumericBuilder(name, config?.precision, config?.scale);
    }
    var decimal2 = numeric;
  }
});

// node_modules/drizzle-orm/pg-core/columns/point.cjs
var require_point = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/point.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var point_exports = {};
    __export2(point_exports, {
      PgPointObject: () => PgPointObject,
      PgPointObjectBuilder: () => PgPointObjectBuilder,
      PgPointTuple: () => PgPointTuple,
      PgPointTupleBuilder: () => PgPointTupleBuilder,
      point: () => point
    });
    module.exports = __toCommonJS(point_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgPointTupleBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgPointTupleBuilder";
      constructor(name) {
        super(name, "array", "PgPointTuple");
      }
      /** @internal */
      build(table) {
        return new PgPointTuple(
          table,
          this.config
        );
      }
    };
    var PgPointTuple = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgPointTuple";
      getSQLType() {
        return "point";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          const [x, y] = value.slice(1, -1).split(",");
          return [Number.parseFloat(x), Number.parseFloat(y)];
        }
        return [value.x, value.y];
      }
      mapToDriverValue(value) {
        return `(${value[0]},${value[1]})`;
      }
    };
    var PgPointObjectBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgPointObjectBuilder";
      constructor(name) {
        super(name, "json", "PgPointObject");
      }
      /** @internal */
      build(table) {
        return new PgPointObject(
          table,
          this.config
        );
      }
    };
    var PgPointObject = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgPointObject";
      getSQLType() {
        return "point";
      }
      mapFromDriverValue(value) {
        if (typeof value === "string") {
          const [x, y] = value.slice(1, -1).split(",");
          return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
        }
        return value;
      }
      mapToDriverValue(value) {
        return `(${value.x},${value.y})`;
      }
    };
    function point(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (!config?.mode || config.mode === "tuple") {
        return new PgPointTupleBuilder(name);
      }
      return new PgPointObjectBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.cjs
var require_utils2 = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    __export2(utils_exports, {
      parseEWKB: () => parseEWKB
    });
    module.exports = __toCommonJS(utils_exports);
    function hexToBytes(hex) {
      const bytes = [];
      for (let c = 0; c < hex.length; c += 2) {
        bytes.push(Number.parseInt(hex.slice(c, c + 2), 16));
      }
      return new Uint8Array(bytes);
    }
    function bytesToFloat64(bytes, offset) {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      for (let i = 0; i < 8; i++) {
        view.setUint8(i, bytes[offset + i]);
      }
      return view.getFloat64(0, true);
    }
    function parseEWKB(hex) {
      const bytes = hexToBytes(hex);
      let offset = 0;
      const byteOrder = bytes[offset];
      offset += 1;
      const view = new DataView(bytes.buffer);
      const geomType = view.getUint32(offset, byteOrder === 1);
      offset += 4;
      let _srid;
      if (geomType & 536870912) {
        _srid = view.getUint32(offset, byteOrder === 1);
        offset += 4;
      }
      if ((geomType & 65535) === 1) {
        const x = bytesToFloat64(bytes, offset);
        offset += 8;
        const y = bytesToFloat64(bytes, offset);
        offset += 8;
        return [x, y];
      }
      throw new Error("Unsupported geometry type");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.cjs
var require_geometry = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var geometry_exports = {};
    __export2(geometry_exports, {
      PgGeometry: () => PgGeometry,
      PgGeometryBuilder: () => PgGeometryBuilder,
      PgGeometryObject: () => PgGeometryObject,
      PgGeometryObjectBuilder: () => PgGeometryObjectBuilder,
      geometry: () => geometry
    });
    module.exports = __toCommonJS(geometry_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_utils2 = require_utils2();
    var PgGeometryBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgGeometryBuilder";
      constructor(name) {
        super(name, "array", "PgGeometry");
      }
      /** @internal */
      build(table) {
        return new PgGeometry(
          table,
          this.config
        );
      }
    };
    var PgGeometry = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgGeometry";
      getSQLType() {
        return "geometry(point)";
      }
      mapFromDriverValue(value) {
        return (0, import_utils2.parseEWKB)(value);
      }
      mapToDriverValue(value) {
        return `point(${value[0]} ${value[1]})`;
      }
    };
    var PgGeometryObjectBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgGeometryObjectBuilder";
      constructor(name) {
        super(name, "json", "PgGeometryObject");
      }
      /** @internal */
      build(table) {
        return new PgGeometryObject(
          table,
          this.config
        );
      }
    };
    var PgGeometryObject = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgGeometryObject";
      getSQLType() {
        return "geometry(point)";
      }
      mapFromDriverValue(value) {
        const parsed = (0, import_utils2.parseEWKB)(value);
        return { x: parsed[0], y: parsed[1] };
      }
      mapToDriverValue(value) {
        return `point(${value.x} ${value.y})`;
      }
    };
    function geometry(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (!config?.mode || config.mode === "tuple") {
        return new PgGeometryBuilder(name);
      }
      return new PgGeometryObjectBuilder(name);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/real.cjs
var require_real = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/real.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var real_exports = {};
    __export2(real_exports, {
      PgReal: () => PgReal,
      PgRealBuilder: () => PgRealBuilder,
      real: () => real
    });
    module.exports = __toCommonJS(real_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgRealBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgRealBuilder";
      constructor(name, length) {
        super(name, "number", "PgReal");
        this.config.length = length;
      }
      /** @internal */
      build(table) {
        return new PgReal(table, this.config);
      }
    };
    var PgReal = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgReal";
      constructor(table, config) {
        super(table, config);
      }
      getSQLType() {
        return "real";
      }
      mapFromDriverValue = (value) => {
        if (typeof value === "string") {
          return Number.parseFloat(value);
        }
        return value;
      };
    };
    function real(name) {
      return new PgRealBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/serial.cjs
var require_serial = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/serial.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var serial_exports = {};
    __export2(serial_exports, {
      PgSerial: () => PgSerial,
      PgSerialBuilder: () => PgSerialBuilder,
      serial: () => serial2
    });
    module.exports = __toCommonJS(serial_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgSerialBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgSerialBuilder";
      constructor(name) {
        super(name, "number", "PgSerial");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgSerial(table, this.config);
      }
    };
    var PgSerial = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgSerial";
      getSQLType() {
        return "serial";
      }
    };
    function serial2(name) {
      return new PgSerialBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/smallint.cjs
var require_smallint = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/smallint.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var smallint_exports = {};
    __export2(smallint_exports, {
      PgSmallInt: () => PgSmallInt,
      PgSmallIntBuilder: () => PgSmallIntBuilder,
      smallint: () => smallint
    });
    module.exports = __toCommonJS(smallint_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var import_int_common = require_int_common();
    var PgSmallIntBuilder = class extends import_int_common.PgIntColumnBaseBuilder {
      static [import_entity.entityKind] = "PgSmallIntBuilder";
      constructor(name) {
        super(name, "number", "PgSmallInt");
      }
      /** @internal */
      build(table) {
        return new PgSmallInt(table, this.config);
      }
    };
    var PgSmallInt = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgSmallInt";
      getSQLType() {
        return "smallint";
      }
      mapFromDriverValue = (value) => {
        if (typeof value === "string") {
          return Number(value);
        }
        return value;
      };
    };
    function smallint(name) {
      return new PgSmallIntBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/smallserial.cjs
var require_smallserial = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/smallserial.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var smallserial_exports = {};
    __export2(smallserial_exports, {
      PgSmallSerial: () => PgSmallSerial,
      PgSmallSerialBuilder: () => PgSmallSerialBuilder,
      smallserial: () => smallserial
    });
    module.exports = __toCommonJS(smallserial_exports);
    var import_entity = require_entity();
    var import_common = require_common();
    var PgSmallSerialBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgSmallSerialBuilder";
      constructor(name) {
        super(name, "number", "PgSmallSerial");
        this.config.hasDefault = true;
        this.config.notNull = true;
      }
      /** @internal */
      build(table) {
        return new PgSmallSerial(
          table,
          this.config
        );
      }
    };
    var PgSmallSerial = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgSmallSerial";
      getSQLType() {
        return "smallserial";
      }
    };
    function smallserial(name) {
      return new PgSmallSerialBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/text.cjs
var require_text = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/text.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var text_exports = {};
    __export2(text_exports, {
      PgText: () => PgText,
      PgTextBuilder: () => PgTextBuilder,
      text: () => text2
    });
    module.exports = __toCommonJS(text_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgTextBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgTextBuilder";
      constructor(name, config) {
        super(name, "string", "PgText");
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgText(table, this.config);
      }
    };
    var PgText = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgText";
      enumValues = this.config.enumValues;
      getSQLType() {
        return "text";
      }
    };
    function text2(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgTextBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/time.cjs
var require_time = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/time.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var time_exports = {};
    __export2(time_exports, {
      PgTime: () => PgTime,
      PgTimeBuilder: () => PgTimeBuilder,
      time: () => time
    });
    module.exports = __toCommonJS(time_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_date_common = require_date_common();
    var PgTimeBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      constructor(name, withTimezone, precision) {
        super(name, "string", "PgTime");
        this.withTimezone = withTimezone;
        this.precision = precision;
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      static [import_entity.entityKind] = "PgTimeBuilder";
      /** @internal */
      build(table) {
        return new PgTime(table, this.config);
      }
    };
    var PgTime = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgTime";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : `(${this.precision})`;
        return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
    };
    function time(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/timestamp.cjs
var require_timestamp = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/timestamp.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var timestamp_exports = {};
    __export2(timestamp_exports, {
      PgTimestamp: () => PgTimestamp,
      PgTimestampBuilder: () => PgTimestampBuilder,
      PgTimestampString: () => PgTimestampString,
      PgTimestampStringBuilder: () => PgTimestampStringBuilder,
      timestamp: () => timestamp2
    });
    module.exports = __toCommonJS(timestamp_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var import_date_common = require_date_common();
    var PgTimestampBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      static [import_entity.entityKind] = "PgTimestampBuilder";
      constructor(name, withTimezone, precision) {
        super(name, "date", "PgTimestamp");
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      /** @internal */
      build(table) {
        return new PgTimestamp(table, this.config);
      }
    };
    var PgTimestamp = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgTimestamp";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
        return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
      mapFromDriverValue = (value) => {
        return new Date(this.withTimezone ? value : value + "+0000");
      };
      mapToDriverValue = (value) => {
        return value.toISOString();
      };
    };
    var PgTimestampStringBuilder = class extends import_date_common.PgDateColumnBaseBuilder {
      static [import_entity.entityKind] = "PgTimestampStringBuilder";
      constructor(name, withTimezone, precision) {
        super(name, "string", "PgTimestampString");
        this.config.withTimezone = withTimezone;
        this.config.precision = precision;
      }
      /** @internal */
      build(table) {
        return new PgTimestampString(
          table,
          this.config
        );
      }
    };
    var PgTimestampString = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgTimestampString";
      withTimezone;
      precision;
      constructor(table, config) {
        super(table, config);
        this.withTimezone = config.withTimezone;
        this.precision = config.precision;
      }
      getSQLType() {
        const precision = this.precision === void 0 ? "" : `(${this.precision})`;
        return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
      }
    };
    function timestamp2(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      if (config?.mode === "string") {
        return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
      }
      return new PgTimestampBuilder(name, config?.withTimezone ?? false, config?.precision);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/uuid.cjs
var require_uuid = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/uuid.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var uuid_exports = {};
    __export2(uuid_exports, {
      PgUUID: () => PgUUID,
      PgUUIDBuilder: () => PgUUIDBuilder,
      uuid: () => uuid
    });
    module.exports = __toCommonJS(uuid_exports);
    var import_entity = require_entity();
    var import_sql = require_sql();
    var import_common = require_common();
    var PgUUIDBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgUUIDBuilder";
      constructor(name) {
        super(name, "string", "PgUUID");
      }
      /**
       * Adds `default gen_random_uuid()` to the column definition.
       */
      defaultRandom() {
        return this.default(import_sql.sql`gen_random_uuid()`);
      }
      /** @internal */
      build(table) {
        return new PgUUID(table, this.config);
      }
    };
    var PgUUID = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgUUID";
      getSQLType() {
        return "uuid";
      }
    };
    function uuid(name) {
      return new PgUUIDBuilder(name ?? "");
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/varchar.cjs
var require_varchar = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/varchar.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var varchar_exports = {};
    __export2(varchar_exports, {
      PgVarchar: () => PgVarchar,
      PgVarcharBuilder: () => PgVarcharBuilder,
      varchar: () => varchar
    });
    module.exports = __toCommonJS(varchar_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgVarcharBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgVarcharBuilder";
      constructor(name, config) {
        super(name, "string", "PgVarchar");
        this.config.length = config.length;
        this.config.enumValues = config.enum;
      }
      /** @internal */
      build(table) {
        return new PgVarchar(
          table,
          this.config
        );
      }
    };
    var PgVarchar = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgVarchar";
      length = this.config.length;
      enumValues = this.config.enumValues;
      getSQLType() {
        return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
      }
    };
    function varchar(a, b = {}) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgVarcharBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.cjs
var require_bit = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var bit_exports = {};
    __export2(bit_exports, {
      PgBinaryVector: () => PgBinaryVector,
      PgBinaryVectorBuilder: () => PgBinaryVectorBuilder,
      bit: () => bit
    });
    module.exports = __toCommonJS(bit_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgBinaryVectorBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgBinaryVectorBuilder";
      constructor(name, config) {
        super(name, "string", "PgBinaryVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgBinaryVector(
          table,
          this.config
        );
      }
    };
    var PgBinaryVector = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgBinaryVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `bit(${this.dimensions})`;
      }
    };
    function bit(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgBinaryVectorBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.cjs
var require_halfvec = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var halfvec_exports = {};
    __export2(halfvec_exports, {
      PgHalfVector: () => PgHalfVector,
      PgHalfVectorBuilder: () => PgHalfVectorBuilder,
      halfvec: () => halfvec
    });
    module.exports = __toCommonJS(halfvec_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgHalfVectorBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgHalfVectorBuilder";
      constructor(name, config) {
        super(name, "array", "PgHalfVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgHalfVector(
          table,
          this.config
        );
      }
    };
    var PgHalfVector = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgHalfVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `halfvec(${this.dimensions})`;
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
      }
    };
    function halfvec(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgHalfVectorBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.cjs
var require_sparsevec = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var sparsevec_exports = {};
    __export2(sparsevec_exports, {
      PgSparseVector: () => PgSparseVector,
      PgSparseVectorBuilder: () => PgSparseVectorBuilder,
      sparsevec: () => sparsevec
    });
    module.exports = __toCommonJS(sparsevec_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgSparseVectorBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgSparseVectorBuilder";
      constructor(name, config) {
        super(name, "string", "PgSparseVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgSparseVector(
          table,
          this.config
        );
      }
    };
    var PgSparseVector = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgSparseVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `sparsevec(${this.dimensions})`;
      }
    };
    function sparsevec(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgSparseVectorBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.cjs
var require_vector = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var vector_exports = {};
    __export2(vector_exports, {
      PgVector: () => PgVector,
      PgVectorBuilder: () => PgVectorBuilder,
      vector: () => vector
    });
    module.exports = __toCommonJS(vector_exports);
    var import_entity = require_entity();
    var import_utils = require_utils();
    var import_common = require_common();
    var PgVectorBuilder = class extends import_common.PgColumnBuilder {
      static [import_entity.entityKind] = "PgVectorBuilder";
      constructor(name, config) {
        super(name, "array", "PgVector");
        this.config.dimensions = config.dimensions;
      }
      /** @internal */
      build(table) {
        return new PgVector(
          table,
          this.config
        );
      }
    };
    var PgVector = class extends import_common.PgColumn {
      static [import_entity.entityKind] = "PgVector";
      dimensions = this.config.dimensions;
      getSQLType() {
        return `vector(${this.dimensions})`;
      }
      mapToDriverValue(value) {
        return JSON.stringify(value);
      }
      mapFromDriverValue(value) {
        return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
      }
    };
    function vector(a, b) {
      const { name, config } = (0, import_utils.getColumnNameAndConfig)(a, b);
      return new PgVectorBuilder(name, config);
    }
  }
});

// node_modules/drizzle-orm/pg-core/columns/all.cjs
var require_all = __commonJS({
  "node_modules/drizzle-orm/pg-core/columns/all.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var all_exports = {};
    __export2(all_exports, {
      getPgColumnBuilders: () => getPgColumnBuilders
    });
    module.exports = __toCommonJS(all_exports);
    var import_bigint = require_bigint();
    var import_bigserial = require_bigserial();
    var import_boolean = require_boolean();
    var import_char = require_char();
    var import_cidr = require_cidr();
    var import_custom = require_custom();
    var import_date = require_date();
    var import_double_precision = require_double_precision();
    var import_inet = require_inet();
    var import_integer = require_integer();
    var import_interval = require_interval();
    var import_json = require_json();
    var import_jsonb = require_jsonb();
    var import_line = require_line();
    var import_macaddr = require_macaddr();
    var import_macaddr8 = require_macaddr8();
    var import_numeric = require_numeric();
    var import_point = require_point();
    var import_geometry = require_geometry();
    var import_real = require_real();
    var import_serial = require_serial();
    var import_smallint = require_smallint();
    var import_smallserial = require_smallserial();
    var import_text = require_text();
    var import_time = require_time();
    var import_timestamp = require_timestamp();
    var import_uuid = require_uuid();
    var import_varchar = require_varchar();
    var import_bit = require_bit();
    var import_halfvec = require_halfvec();
    var import_sparsevec = require_sparsevec();
    var import_vector = require_vector();
    function getPgColumnBuilders() {
      return {
        bigint: import_bigint.bigint,
        bigserial: import_bigserial.bigserial,
        boolean: import_boolean.boolean,
        char: import_char.char,
        cidr: import_cidr.cidr,
        customType: import_custom.customType,
        date: import_date.date,
        doublePrecision: import_double_precision.doublePrecision,
        inet: import_inet.inet,
        integer: import_integer.integer,
        interval: import_interval.interval,
        json: import_json.json,
        jsonb: import_jsonb.jsonb,
        line: import_line.line,
        macaddr: import_macaddr.macaddr,
        macaddr8: import_macaddr8.macaddr8,
        numeric: import_numeric.numeric,
        point: import_point.point,
        geometry: import_geometry.geometry,
        real: import_real.real,
        serial: import_serial.serial,
        smallint: import_smallint.smallint,
        smallserial: import_smallserial.smallserial,
        text: import_text.text,
        time: import_time.time,
        timestamp: import_timestamp.timestamp,
        uuid: import_uuid.uuid,
        varchar: import_varchar.varchar,
        bit: import_bit.bit,
        halfvec: import_halfvec.halfvec,
        sparsevec: import_sparsevec.sparsevec,
        vector: import_vector.vector
      };
    }
  }
});

// node_modules/drizzle-orm/pg-core/table.cjs
var require_table2 = __commonJS({
  "node_modules/drizzle-orm/pg-core/table.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var table_exports = {};
    __export2(table_exports, {
      EnableRLS: () => EnableRLS,
      InlineForeignKeys: () => InlineForeignKeys,
      PgTable: () => PgTable,
      pgTable: () => pgTable2,
      pgTableCreator: () => pgTableCreator,
      pgTableWithSchema: () => pgTableWithSchema
    });
    module.exports = __toCommonJS(table_exports);
    var import_entity = require_entity();
    var import_table = require_table();
    var import_all = require_all();
    var InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
    var EnableRLS = Symbol.for("drizzle:EnableRLS");
    var PgTable = class extends import_table.Table {
      static [import_entity.entityKind] = "PgTable";
      /** @internal */
      static Symbol = Object.assign({}, import_table.Table.Symbol, {
        InlineForeignKeys,
        EnableRLS
      });
      /**@internal */
      [InlineForeignKeys] = [];
      /** @internal */
      [EnableRLS] = false;
      /** @internal */
      [import_table.Table.Symbol.ExtraConfigBuilder] = void 0;
    };
    function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
      const rawTable = new PgTable(name, schema, baseName);
      const parsedColumns = typeof columns === "function" ? columns((0, import_all.getPgColumnBuilders)()) : columns;
      const builtColumns = Object.fromEntries(
        Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
          const colBuilder = colBuilderBase;
          colBuilder.setName(name2);
          const column = colBuilder.build(rawTable);
          rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
          return [name2, column];
        })
      );
      const builtColumnsForExtraConfig = Object.fromEntries(
        Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
          const colBuilder = colBuilderBase;
          colBuilder.setName(name2);
          const column = colBuilder.buildExtraConfigColumn(rawTable);
          return [name2, column];
        })
      );
      const table = Object.assign(rawTable, builtColumns);
      table[import_table.Table.Symbol.Columns] = builtColumns;
      table[import_table.Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
      if (extraConfig) {
        table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
      }
      return Object.assign(table, {
        enableRLS: () => {
          table[PgTable.Symbol.EnableRLS] = true;
          return table;
        }
      });
    }
    var pgTable2 = (name, columns, extraConfig) => {
      return pgTableWithSchema(name, columns, extraConfig, void 0);
    };
    function pgTableCreator(customizeTableName) {
      return (name, columns, extraConfig) => {
        return pgTableWithSchema(customizeTableName(name), columns, extraConfig, void 0, name);
      };
    }
  }
});

// node_modules/drizzle-orm/pg-core/primary-keys.cjs
var require_primary_keys = __commonJS({
  "node_modules/drizzle-orm/pg-core/primary-keys.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var primary_keys_exports = {};
    __export2(primary_keys_exports, {
      PrimaryKey: () => PrimaryKey,
      PrimaryKeyBuilder: () => PrimaryKeyBuilder,
      primaryKey: () => primaryKey
    });
    module.exports = __toCommonJS(primary_keys_exports);
    var import_entity = require_entity();
    var import_table = require_table2();
    function primaryKey(...config) {
      if (config[0].columns) {
        return new PrimaryKeyBuilder(config[0].columns, config[0].name);
      }
      return new PrimaryKeyBuilder(config);
    }
    var PrimaryKeyBuilder = class {
      static [import_entity.entityKind] = "PgPrimaryKeyBuilder";
      /** @internal */
      columns;
      /** @internal */
      name;
      constructor(columns, name) {
        this.columns = columns;
        this.name = name;
      }
      /** @internal */
      build(table) {
        return new PrimaryKey(table, this.columns, this.name);
      }
    };
    var PrimaryKey = class {
      constructor(table, columns, name) {
        this.table = table;
        this.columns = columns;
        this.name = name;
      }
      static [import_entity.entityKind] = "PgPrimaryKey";
      columns;
      name;
      getName() {
        return this.name ?? `${this.table[import_table.PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
      }
    };
  }
});

// node_modules/drizzle-orm/relations.cjs
var require_relations = __commonJS({
  "node_modules/drizzle-orm/relations.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var relations_exports = {};
    __export2(relations_exports, {
      Many: () => Many,
      One: () => One,
      Relation: () => Relation,
      Relations: () => Relations,
      createMany: () => createMany,
      createOne: () => createOne,
      createTableRelationsHelpers: () => createTableRelationsHelpers,
      extractTablesRelationalConfig: () => extractTablesRelationalConfig,
      getOperators: () => getOperators,
      getOrderByOperators: () => getOrderByOperators,
      mapRelationalRow: () => mapRelationalRow,
      normalizeRelation: () => normalizeRelation,
      relations: () => relations2
    });
    module.exports = __toCommonJS(relations_exports);
    var import_table = require_table();
    var import_column = require_column();
    var import_entity = require_entity();
    var import_primary_keys = require_primary_keys();
    var import_expressions = require_expressions();
    var import_sql = require_sql();
    var Relation = class {
      constructor(sourceTable, referencedTable, relationName) {
        this.sourceTable = sourceTable;
        this.referencedTable = referencedTable;
        this.relationName = relationName;
        this.referencedTableName = referencedTable[import_table.Table.Symbol.Name];
      }
      static [import_entity.entityKind] = "Relation";
      referencedTableName;
      fieldName;
    };
    var Relations = class {
      constructor(table, config) {
        this.table = table;
        this.config = config;
      }
      static [import_entity.entityKind] = "Relations";
    };
    var One = class _One extends Relation {
      constructor(sourceTable, referencedTable, config, isNullable) {
        super(sourceTable, referencedTable, config?.relationName);
        this.config = config;
        this.isNullable = isNullable;
      }
      static [import_entity.entityKind] = "One";
      withFieldName(fieldName) {
        const relation = new _One(
          this.sourceTable,
          this.referencedTable,
          this.config,
          this.isNullable
        );
        relation.fieldName = fieldName;
        return relation;
      }
    };
    var Many = class _Many extends Relation {
      constructor(sourceTable, referencedTable, config) {
        super(sourceTable, referencedTable, config?.relationName);
        this.config = config;
      }
      static [import_entity.entityKind] = "Many";
      withFieldName(fieldName) {
        const relation = new _Many(
          this.sourceTable,
          this.referencedTable,
          this.config
        );
        relation.fieldName = fieldName;
        return relation;
      }
    };
    function getOperators() {
      return {
        and: import_expressions.and,
        between: import_expressions.between,
        eq: import_expressions.eq,
        exists: import_expressions.exists,
        gt: import_expressions.gt,
        gte: import_expressions.gte,
        ilike: import_expressions.ilike,
        inArray: import_expressions.inArray,
        isNull: import_expressions.isNull,
        isNotNull: import_expressions.isNotNull,
        like: import_expressions.like,
        lt: import_expressions.lt,
        lte: import_expressions.lte,
        ne: import_expressions.ne,
        not: import_expressions.not,
        notBetween: import_expressions.notBetween,
        notExists: import_expressions.notExists,
        notLike: import_expressions.notLike,
        notIlike: import_expressions.notIlike,
        notInArray: import_expressions.notInArray,
        or: import_expressions.or,
        sql: import_sql.sql
      };
    }
    function getOrderByOperators() {
      return {
        sql: import_sql.sql,
        asc: import_expressions.asc,
        desc: import_expressions.desc
      };
    }
    function extractTablesRelationalConfig(schema, configHelpers) {
      if (Object.keys(schema).length === 1 && "default" in schema && !(0, import_entity.is)(schema["default"], import_table.Table)) {
        schema = schema["default"];
      }
      const tableNamesMap = {};
      const relationsBuffer = {};
      const tablesConfig = {};
      for (const [key, value] of Object.entries(schema)) {
        if ((0, import_entity.is)(value, import_table.Table)) {
          const dbName = (0, import_table.getTableUniqueName)(value);
          const bufferedRelations = relationsBuffer[dbName];
          tableNamesMap[dbName] = key;
          tablesConfig[key] = {
            tsName: key,
            dbName: value[import_table.Table.Symbol.Name],
            schema: value[import_table.Table.Symbol.Schema],
            columns: value[import_table.Table.Symbol.Columns],
            relations: bufferedRelations?.relations ?? {},
            primaryKey: bufferedRelations?.primaryKey ?? []
          };
          for (const column of Object.values(
            value[import_table.Table.Symbol.Columns]
          )) {
            if (column.primary) {
              tablesConfig[key].primaryKey.push(column);
            }
          }
          const extraConfig = value[import_table.Table.Symbol.ExtraConfigBuilder]?.(value[import_table.Table.Symbol.ExtraConfigColumns]);
          if (extraConfig) {
            for (const configEntry of Object.values(extraConfig)) {
              if ((0, import_entity.is)(configEntry, import_primary_keys.PrimaryKeyBuilder)) {
                tablesConfig[key].primaryKey.push(...configEntry.columns);
              }
            }
          }
        } else if ((0, import_entity.is)(value, Relations)) {
          const dbName = (0, import_table.getTableUniqueName)(value.table);
          const tableName = tableNamesMap[dbName];
          const relations22 = value.config(
            configHelpers(value.table)
          );
          let primaryKey;
          for (const [relationName, relation] of Object.entries(relations22)) {
            if (tableName) {
              const tableConfig = tablesConfig[tableName];
              tableConfig.relations[relationName] = relation;
              if (primaryKey) {
                tableConfig.primaryKey.push(...primaryKey);
              }
            } else {
              if (!(dbName in relationsBuffer)) {
                relationsBuffer[dbName] = {
                  relations: {},
                  primaryKey
                };
              }
              relationsBuffer[dbName].relations[relationName] = relation;
            }
          }
        }
      }
      return { tables: tablesConfig, tableNamesMap };
    }
    function relations2(table, relations22) {
      return new Relations(
        table,
        (helpers) => Object.fromEntries(
          Object.entries(relations22(helpers)).map(([key, value]) => [
            key,
            value.withFieldName(key)
          ])
        )
      );
    }
    function createOne(sourceTable) {
      return function one(table, config) {
        return new One(
          sourceTable,
          table,
          config,
          config?.fields.reduce((res, f) => res && f.notNull, true) ?? false
        );
      };
    }
    function createMany(sourceTable) {
      return function many(referencedTable, config) {
        return new Many(sourceTable, referencedTable, config);
      };
    }
    function normalizeRelation(schema, tableNamesMap, relation) {
      if ((0, import_entity.is)(relation, One) && relation.config) {
        return {
          fields: relation.config.fields,
          references: relation.config.references
        };
      }
      const referencedTableTsName = tableNamesMap[(0, import_table.getTableUniqueName)(relation.referencedTable)];
      if (!referencedTableTsName) {
        throw new Error(
          `Table "${relation.referencedTable[import_table.Table.Symbol.Name]}" not found in schema`
        );
      }
      const referencedTableConfig = schema[referencedTableTsName];
      if (!referencedTableConfig) {
        throw new Error(`Table "${referencedTableTsName}" not found in schema`);
      }
      const sourceTable = relation.sourceTable;
      const sourceTableTsName = tableNamesMap[(0, import_table.getTableUniqueName)(sourceTable)];
      if (!sourceTableTsName) {
        throw new Error(
          `Table "${sourceTable[import_table.Table.Symbol.Name]}" not found in schema`
        );
      }
      const reverseRelations = [];
      for (const referencedTableRelation of Object.values(
        referencedTableConfig.relations
      )) {
        if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
          reverseRelations.push(referencedTableRelation);
        }
      }
      if (reverseRelations.length > 1) {
        throw relation.relationName ? new Error(
          `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
        ) : new Error(
          `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[import_table.Table.Symbol.Name]}". Please specify relation name`
        );
      }
      if (reverseRelations[0] && (0, import_entity.is)(reverseRelations[0], One) && reverseRelations[0].config) {
        return {
          fields: reverseRelations[0].config.references,
          references: reverseRelations[0].config.fields
        };
      }
      throw new Error(
        `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
      );
    }
    function createTableRelationsHelpers(sourceTable) {
      return {
        one: createOne(sourceTable),
        many: createMany(sourceTable)
      };
    }
    function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
      const result = {};
      for (const [
        selectionItemIndex,
        selectionItem
      ] of buildQueryResultSelection.entries()) {
        if (selectionItem.isJson) {
          const relation = tableConfig.relations[selectionItem.tsKey];
          const rawSubRows = row[selectionItemIndex];
          const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
          result[selectionItem.tsKey] = (0, import_entity.is)(relation, One) ? subRows && mapRelationalRow(
            tablesConfig,
            tablesConfig[selectionItem.relationTableTsKey],
            subRows,
            selectionItem.selection,
            mapColumnValue
          ) : subRows.map(
            (subRow) => mapRelationalRow(
              tablesConfig,
              tablesConfig[selectionItem.relationTableTsKey],
              subRow,
              selectionItem.selection,
              mapColumnValue
            )
          );
        } else {
          const value = mapColumnValue(row[selectionItemIndex]);
          const field = selectionItem.field;
          let decoder;
          if ((0, import_entity.is)(field, import_column.Column)) {
            decoder = field;
          } else if ((0, import_entity.is)(field, import_sql.SQL)) {
            decoder = field.decoder;
          } else {
            decoder = field.sql.decoder;
          }
          result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
        }
      }
      return result;
    }
  }
});

// node_modules/drizzle-orm/sql/functions/aggregate.cjs
var require_aggregate = __commonJS({
  "node_modules/drizzle-orm/sql/functions/aggregate.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var aggregate_exports = {};
    __export2(aggregate_exports, {
      avg: () => avg,
      avgDistinct: () => avgDistinct,
      count: () => count,
      countDistinct: () => countDistinct,
      max: () => max,
      min: () => min,
      sum: () => sum,
      sumDistinct: () => sumDistinct
    });
    module.exports = __toCommonJS(aggregate_exports);
    var import_column = require_column();
    var import_entity = require_entity();
    var import_sql = require_sql();
    function count(expression) {
      return import_sql.sql`count(${expression || import_sql.sql.raw("*")})`.mapWith(Number);
    }
    function countDistinct(expression) {
      return import_sql.sql`count(distinct ${expression})`.mapWith(Number);
    }
    function avg(expression) {
      return import_sql.sql`avg(${expression})`.mapWith(String);
    }
    function avgDistinct(expression) {
      return import_sql.sql`avg(distinct ${expression})`.mapWith(String);
    }
    function sum(expression) {
      return import_sql.sql`sum(${expression})`.mapWith(String);
    }
    function sumDistinct(expression) {
      return import_sql.sql`sum(distinct ${expression})`.mapWith(String);
    }
    function max(expression) {
      return import_sql.sql`max(${expression})`.mapWith((0, import_entity.is)(expression, import_column.Column) ? expression : String);
    }
    function min(expression) {
      return import_sql.sql`min(${expression})`.mapWith((0, import_entity.is)(expression, import_column.Column) ? expression : String);
    }
  }
});

// node_modules/drizzle-orm/sql/functions/vector.cjs
var require_vector2 = __commonJS({
  "node_modules/drizzle-orm/sql/functions/vector.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var vector_exports = {};
    __export2(vector_exports, {
      cosineDistance: () => cosineDistance,
      hammingDistance: () => hammingDistance,
      innerProduct: () => innerProduct,
      jaccardDistance: () => jaccardDistance,
      l1Distance: () => l1Distance,
      l2Distance: () => l2Distance
    });
    module.exports = __toCommonJS(vector_exports);
    var import_sql = require_sql();
    function toSql(value) {
      return JSON.stringify(value);
    }
    function l2Distance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <-> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <-> ${value}`;
    }
    function l1Distance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <+> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <+> ${value}`;
    }
    function innerProduct(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <#> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <#> ${value}`;
    }
    function cosineDistance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <=> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <=> ${value}`;
    }
    function hammingDistance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <~> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <~> ${value}`;
    }
    function jaccardDistance(column, value) {
      if (Array.isArray(value)) {
        return import_sql.sql`${column} <%> ${toSql(value)}`;
      }
      return import_sql.sql`${column} <%> ${value}`;
    }
  }
});

// node_modules/drizzle-orm/sql/functions/index.cjs
var require_functions = __commonJS({
  "node_modules/drizzle-orm/sql/functions/index.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps2(target, mod, "default"), secondTarget && __copyProps2(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var functions_exports = {};
    module.exports = __toCommonJS(functions_exports);
    __reExport(functions_exports, require_aggregate(), module.exports);
    __reExport(functions_exports, require_vector2(), module.exports);
  }
});

// node_modules/drizzle-orm/sql/index.cjs
var require_sql2 = __commonJS({
  "node_modules/drizzle-orm/sql/index.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps2(target, mod, "default"), secondTarget && __copyProps2(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var sql_exports = {};
    module.exports = __toCommonJS(sql_exports);
    __reExport(sql_exports, require_expressions(), module.exports);
    __reExport(sql_exports, require_functions(), module.exports);
    __reExport(sql_exports, require_sql(), module.exports);
  }
});

// node_modules/drizzle-orm/index.cjs
var require_drizzle_orm = __commonJS({
  "node_modules/drizzle-orm/index.cjs"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __copyProps2 = (to, from, except, desc2) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc2(from, key)) || desc2.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps2(target, mod, "default"), secondTarget && __copyProps2(secondTarget, mod, "default"));
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var src_exports = {};
    module.exports = __toCommonJS(src_exports);
    __reExport(src_exports, require_alias(), module.exports);
    __reExport(src_exports, require_column_builder(), module.exports);
    __reExport(src_exports, require_column(), module.exports);
    __reExport(src_exports, require_entity(), module.exports);
    __reExport(src_exports, require_errors(), module.exports);
    __reExport(src_exports, require_expressions2(), module.exports);
    __reExport(src_exports, require_logger(), module.exports);
    __reExport(src_exports, require_operations(), module.exports);
    __reExport(src_exports, require_query_promise(), module.exports);
    __reExport(src_exports, require_relations(), module.exports);
    __reExport(src_exports, require_sql2(), module.exports);
    __reExport(src_exports, require_subquery(), module.exports);
    __reExport(src_exports, require_table(), module.exports);
    __reExport(src_exports, require_utils(), module.exports);
    __reExport(src_exports, require_view_common(), module.exports);
  }
});

// server/barcode-utils.ts
var barcode_utils_exports = {};
__export(barcode_utils_exports, {
  lookupBarcodeInfo: () => lookupBarcodeInfo
});
import axios from "axios";
import * as cheerio from "cheerio";
function extractProductFromHtml(html, barcode) {
  try {
    const $ = cheerio.load(html);
    console.log("Parsing product details from HTML");
    let productName = "";
    const nameSelectors = [
      ".product-details h4",
      "h1.product-name",
      ".product-name h1",
      ".product-title",
      ".product h1",
      ".card .product-title",
      ".card-title",
      ".item-title",
      ".product-name",
      ".details h1",
      ".details h2"
    ];
    for (const selector of nameSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        productName = element.text().trim();
        console.log(`Found product name using selector: ${selector}`);
        break;
      }
    }
    if (!productName) {
      $("h1, h2, h3, h4").each(function() {
        const text2 = $(this).text().trim();
        if (text2 && !productName) {
          productName = text2;
          console.log(`Found product name in heading: ${text2}`);
        }
      });
    }
    let productImage = "";
    const imageSelectors = [
      ".product-image img",
      ".product-img img",
      "img.product-image",
      ".item-image img",
      ".card-img-top",
      ".product img"
    ];
    for (const selector of imageSelectors) {
      const element = $(selector);
      if (element.length > 0 && element.attr("src")) {
        productImage = element.attr("src") || "";
        console.log(`Found product image using selector: ${selector}`);
        break;
      }
    }
    console.log(`Product name extracted: "${productName}"`);
    console.log(`Product image URL: "${productImage}"`);
    if (productName) {
      console.log(`Found product: ${productName}`);
      let category = "Other";
      let location = "Pantry";
      let quantity = "1";
      let unit = "unit";
      if (/milk|cream|yogurt|cheese|butter/i.test(productName)) {
        category = "Dairy";
        location = "Refrigerator";
      } else if (/fruit|vegetable|produce|salad/i.test(productName)) {
        category = "Produce";
        location = "Refrigerator";
      } else if (/meat|beef|chicken|pork|fish|seafood/i.test(productName)) {
        category = "Meat";
        location = "Refrigerator";
      } else if (/cereal|pasta|rice|flour|sugar|salt/i.test(productName)) {
        category = "Pantry";
        location = "Pantry";
      } else if (/spice|herb|seasoning/i.test(productName)) {
        category = "Spices";
        location = "Spice Rack";
      } else if (/beer|wine|juice|soda|water/i.test(productName)) {
        category = "Beverages";
        location = "Refrigerator";
      } else if (/bread|cake|pie|pastry/i.test(productName)) {
        category = "Bakery";
        location = "Pantry";
      } else if (/chips|cookie|candy|snack/i.test(productName)) {
        category = "Snacks";
        location = "Pantry";
      }
      const qtyMatch = productName.match(/(\d+)\s*(ml|l|g|kg|oz|lb|piece|pack)/i);
      if (qtyMatch) {
        quantity = qtyMatch[1];
        unit = qtyMatch[2].toLowerCase();
      }
      return {
        name: productName,
        imageUrl: productImage,
        quantity,
        unit,
        count: 1,
        barcode,
        location,
        category,
        expiryDate: null
      };
    } else {
      console.log(`No product found with standard selectors, trying to extract from HTML directly`);
      const barcodePositions = [];
      let pos = html.indexOf(barcode);
      while (pos !== -1) {
        barcodePositions.push(pos);
        pos = html.indexOf(barcode, pos + 1);
      }
      if (barcodePositions.length > 0) {
        for (const pos2 of barcodePositions) {
          const startPos = Math.max(0, pos2 - 300);
          const endPos = Math.min(html.length, pos2 + 300);
          const chunk = html.substring(startPos, endPos);
          console.log(`Analyzing chunk around barcode at position ${pos2}`);
          const chunkDom = cheerio.load(chunk);
          const textNodes = chunkDom("*").contents().filter(function() {
            return this.type === "text";
          });
          const potentialNames = [];
          textNodes.each(function() {
            const text2 = chunkDom(this).text().trim();
            if (text2 && text2.split(/\s+/).length > 3 && !/^\d+$/.test(text2)) {
              potentialNames.push(text2);
            }
          });
          if (potentialNames.length > 0) {
            productName = potentialNames.reduce((a, b) => a.length > b.length ? a : b);
            console.log(`Potential product name from direct HTML analysis: "${productName}"`);
            return {
              name: productName,
              imageUrl: "",
              quantity: "1",
              unit: "unit",
              count: 1,
              barcode,
              location: "Pantry",
              category: "Other",
              expiryDate: null
            };
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing HTML:", error);
    return null;
  }
}
async function lookupBarcodeInfo(barcode) {
  barcode = barcode.trim();
  if (!/^\d{6,14}$/.test(barcode)) {
    console.error(`Invalid barcode format: ${barcode}`);
    return null;
  }
  const sources = [
    {
      name: "go-upc.com",
      url: `https://go-upc.com/search?q=${barcode}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0"
      }
    },
    {
      name: "barcodelookup.com",
      url: `https://www.barcodelookup.com/${barcode}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Referer": "https://www.barcodelookup.com/",
        "Upgrade-Insecure-Requests": "1"
      }
    },
    {
      // Alternative format structure
      name: "upcdatabase.org",
      url: `https://www.upcdatabase.org/code/${barcode}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive"
      }
    }
  ];
  console.log(`Looking up barcode ${barcode} from web sources`);
  for (const source of sources) {
    try {
      console.log(`Trying source: ${source.name}`);
      const response = await axios.get(source.url, {
        headers: source.headers,
        timeout: 5e3
        // 5-second timeout to prevent long waits
      });
      if (response.status === 200) {
        if (response.data && typeof response.data === "string" && (response.data.includes("Too Many Requests") || response.data.includes("rate limit") || response.data.includes("sign up"))) {
          console.log(`Rate limited by ${source.name}, trying next source`);
          continue;
        }
        const product = extractProductFromHtml(response.data, barcode);
        if (product) {
          console.log(`Found product details from ${source.name}: ${product.name}`);
          return product;
        } else {
          console.log(`No product found at ${source.name}, trying next source`);
        }
      } else {
        console.log(`Non-200 response from ${source.name}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error with source ${source.name}:`, error);
    }
  }
  console.log(`No product information found for barcode ${barcode} from any source`);
  return {
    name: `Product (${barcode})`,
    imageUrl: "",
    quantity: "1",
    unit: "unit",
    count: 1,
    barcode,
    location: "Pantry",
    category: "Other",
    expiryDate: null
  };
}
var init_barcode_utils = __esm({
  "server/barcode-utils.ts"() {
    "use strict";
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// db/index.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertInventoryItemSchema: () => insertInventoryItemSchema,
  insertRecipeIngredientSchema: () => insertRecipeIngredientSchema,
  insertRecipeSchema: () => insertRecipeSchema,
  inventoryItems: () => inventoryItems,
  loginSchema: () => loginSchema,
  recipeIngredients: () => recipeIngredients,
  recipeIngredientsRelations: () => recipeIngredientsRelations,
  recipes: () => recipes,
  recipesRelations: () => recipesRelations,
  registerSchema: () => registerSchema,
  shoppingItems: () => shoppingItems,
  users: () => users
});
import { pgTable, serial, text, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow()
});
var loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = loginSchema;
var recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  prep_time: integer("prep_time").default(30),
  servings: integer("servings").default(2),
  difficulty: text("difficulty").default("Easy"),
  rating: integer("rating").default(0),
  rating_count: integer("rating_count").default(0),
  image_url: text("image_url"),
  url: text("url"),
  instructions: jsonb("instructions").default("[]"),
  storage_instructions: text("storage_instructions"),
  is_favorite: boolean("is_favorite").default(false),
  cost_per_serving: decimal("cost_per_serving", { precision: 10, scale: 2 }).default("0"),
  nutrition: jsonb("nutrition").default('{"calories":0,"protein":0,"carbs":0,"fat":0}'),
  comments: jsonb("comments").default("[]"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipe_id: integer("recipe_id").references(() => recipes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  created_at: timestamp("created_at").defaultNow()
});
var inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  count: integer("count").default(1),
  barcode: text("barcode"),
  location: text("location"),
  category: text("category"),
  expiry_date: timestamp("expiry_date"),
  image_url: text("image_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var shoppingItems = pgTable("shopping_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category"),
  checked: boolean("checked").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients)
}));
var recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipe_id],
    references: [recipes.id]
  })
}));
var insertRecipeSchema = createInsertSchema(recipes, {
  title: (schema) => schema.min(1, "Title is required"),
  description: (schema) => schema.min(1, "Description is required"),
  prep_time: (schema) => schema.min(1, "Preparation time must be at least 1 minute"),
  servings: (schema) => schema.min(1, "Servings must be at least 1")
});
var insertRecipeIngredientSchema = createInsertSchema(recipeIngredients, {
  name: (schema) => schema.min(1, "Ingredient name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required")
});
var insertInventoryItemSchema = createInsertSchema(inventoryItems, {
  name: (schema) => schema.min(1, "Item name is required"),
  quantity: (schema) => schema.min(1, "Quantity is required"),
  count: (schema) => schema.min(1, "Count must be at least 1")
});

// db/index.ts
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}
var sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});
var db = drizzle(sql, { schema: schema_exports });

// server/storage.ts
var import_drizzle_orm2 = __toESM(require_drizzle_orm(), 1);
import axios2 from "axios";
import * as cheerio2 from "cheerio";
function parseIngredientText(text2) {
  if (!text2 || text2.length < 3) {
    return { name: text2, quantity: "1", unit: "unit" };
  }
  const lowerText = text2.toLowerCase();
  const commonUnits = [
    "cup",
    "cups",
    "tablespoon",
    "tablespoons",
    "tbsp",
    "teaspoon",
    "teaspoons",
    "tsp",
    "oz",
    "ounce",
    "ounces",
    "pound",
    "pounds",
    "lb",
    "lbs",
    "g",
    "gram",
    "grams",
    "kg",
    "ml",
    "milliliter",
    "milliliters",
    "l",
    "liter",
    "liters",
    "pinch",
    "pinches",
    "dash",
    "dashes",
    "clove",
    "cloves",
    "bunch",
    "bunches",
    "sprig",
    "sprigs",
    "piece",
    "pieces",
    "slice",
    "slices",
    "can",
    "cans",
    "jar",
    "jars",
    "package",
    "packages",
    "pkg",
    "box",
    "boxes"
  ];
  const nonIngredientMarkers = [
    // Cooking verbs/actions (only as standalone instructions)
    "preheat",
    "heat",
    "blend",
    "mix",
    "stir",
    "whisk",
    "cut",
    "chop",
    "dice",
    "instructions",
    "directions",
    "steps",
    "method",
    "preparation",
    "prepare",
    "bake",
    "boil",
    "simmer",
    "fry",
    "roast",
    "grill",
    "saute",
    "toast",
    // Recipe section headers
    "ingredients:",
    "directions:",
    "instructions:",
    "method:",
    "preparation:",
    "notes:",
    "equipment:",
    "tools:",
    "utensils:",
    "yield:",
    "servings:",
    "serves:",
    // Nutrition markers - expanded to catch more cases
    "nutrition",
    "nutritional",
    "calories",
    "calorie",
    "kcal",
    "protein",
    "proteins",
    "carbs",
    "carbohydrate",
    "fat",
    "fats",
    "sodium",
    "sugar",
    "fiber",
    "fibre",
    "per serving",
    "per portion",
    "percent",
    "daily value",
    "%",
    "vitamin",
    "mineral",
    "calcium",
    "iron",
    "potassium",
    "magnesium",
    "enjoy!",
    "enjoy",
    "bon appetit",
    // Headers and recipe metadata that should be excluded
    "recipe by",
    "recipe from",
    "author",
    "published",
    "updated",
    "rating",
    "comments",
    "reviews",
    "print recipe",
    "save recipe",
    "share recipe",
    "prep time",
    "cook time",
    "total time",
    "difficulty",
    "cuisine",
    "course"
  ];
  if (nonIngredientMarkers.some((marker) => {
    const markerPos = lowerText.indexOf(marker);
    if (markerPos === 0) {
      const afterMarker = lowerText.charAt(marker.length);
      return afterMarker === "" || afterMarker === " " || afterMarker === ":" || afterMarker === ",";
    }
    return lowerText === marker || lowerText.toUpperCase() === marker.toUpperCase();
  })) {
    return { name: "", quantity: "", unit: "" };
  }
  if (text2.match(/^[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/)) {
    const fractionMap = {
      "\xBD": "0.5",
      "\u2153": "0.33",
      "\u2154": "0.67",
      "\xBC": "0.25",
      "\xBE": "0.75",
      "\u2155": "0.2",
      "\u2156": "0.4",
      "\u2157": "0.6",
      "\u2158": "0.8",
      "\u2159": "0.17",
      "\u215A": "0.83",
      "\u215B": "0.125",
      "\u215C": "0.375",
      "\u215D": "0.625",
      "\u215E": "0.875"
    };
    for (const [fraction, decimal2] of Object.entries(fractionMap)) {
      if (text2.startsWith(fraction)) {
        text2 = text2.replace(fraction, decimal2 + " ");
        break;
      }
    }
  }
  const numberPattern = /^\s*(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)/;
  const fractionOnlyPattern = /^\s*(\d+\/\d+)/;
  const unitPattern = /(?:tablespoons?|tbsp|teaspoons?|tsp|cups?|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|pinch(?:es)?|dash(?:es)?|cloves?|bunch(?:es)?|sprigs?|pieces?|slices?|cans?|jars?|packages?|pkg|boxes?)/i;
  let quantity = "", unit = "", name = "";
  let remainingText = lowerText.trim();
  const numberMatch = remainingText.match(numberPattern);
  const fractionMatch = remainingText.match(fractionOnlyPattern);
  if (numberMatch) {
    quantity = numberMatch[1];
    remainingText = remainingText.substring(numberMatch[0].length).trim();
    const potentialUnit = remainingText.split(/\s+/)[0];
    if (potentialUnit && unitPattern.test(potentialUnit)) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    }
  } else if (fractionMatch) {
    quantity = fractionMatch[1];
    remainingText = remainingText.substring(fractionMatch[0].length).trim();
    const potentialUnit = remainingText.split(/\s+/)[0];
    if (potentialUnit && unitPattern.test(potentialUnit)) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
      unit = potentialUnit;
      remainingText = remainingText.substring(potentialUnit.length).trim();
    }
  } else {
    const rangeMatch = remainingText.match(/^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      quantity = `${rangeMatch[1]}-${rangeMatch[2]}`;
      remainingText = remainingText.substring(rangeMatch[0].length).trim();
      const potentialUnit = remainingText.split(/\s+/)[0];
      if (potentialUnit && unitPattern.test(potentialUnit)) {
        unit = potentialUnit;
        remainingText = remainingText.substring(potentialUnit.length).trim();
      } else if (potentialUnit && commonUnits.includes(potentialUnit.toLowerCase())) {
        unit = potentialUnit;
        remainingText = remainingText.substring(potentialUnit.length).trim();
      }
    }
  }
  if (remainingText) {
    name = remainingText;
    name = name.replace(/,\s*to taste$/, "").replace(/,\s*for serving$/, "").replace(/,\s*for garnish$/, "").replace(/,\s*optional$/, "").trim();
  } else {
    name = text2;
  }
  if (!quantity && (lowerText.startsWith("small") || lowerText.startsWith("medium") || lowerText.startsWith("large") || lowerText.startsWith("fresh") || lowerText.startsWith("dried") || lowerText.startsWith("whole") || lowerText.startsWith("cooked") || lowerText.startsWith("boneless") || lowerText.startsWith("skinless") || lowerText.startsWith("minced") || lowerText.startsWith("diced") || lowerText.startsWith("chopped") || lowerText.startsWith("sliced"))) {
    name = text2;
  }
  const preparationMethods = [
    "sliced",
    "diced",
    "chopped",
    "minced",
    "grated",
    "shredded",
    "julienned",
    "cubed",
    "quartered",
    "halved",
    "peeled",
    "seeded",
    "cored",
    "stemmed",
    "pitted",
    "zested",
    "juiced"
  ];
  if (!quantity && preparationMethods.some((method) => lowerText.includes(`, ${method}`))) {
    name = text2;
    quantity = "2";
  }
  if (lowerText.includes("boneless") && lowerText.includes("skinless") && lowerText.includes("chicken")) {
    if (unit.toLowerCase() === "boneless" || unit.toLowerCase() === "boneless,") {
      name = text2.trim();
      unit = "";
      if (!quantity || quantity === "1") {
        quantity = "2";
      }
    } else if (quantity && !unit) {
      name = text2.replace(quantity, "").trim();
      if (name.toLowerCase().includes("boneless") && name.toLowerCase().includes("skinless") && name.toLowerCase().includes("chicken")) {
        name = name.replace(/^,\s*/, "");
      }
    } else if (!quantity && !unit) {
      name = text2.trim();
      quantity = "2";
    }
    if (lowerText.includes("boneless,") && unit === "skinless") {
      name = text2.trim();
      unit = "";
      if (!quantity) quantity = "2";
    }
  }
  if (lowerText.includes("for serving") || lowerText.includes("to serve")) {
    name = lowerText.replace(/,?\s*(for serving|to serve).*$/, "").trim();
    if (!quantity) quantity = "as needed";
  }
  if (lowerText.includes("lemon") || lowerText.includes("lime") || lowerText.includes("orange")) {
    if (lowerText.includes("zest") || lowerText.includes("zested") || lowerText.includes("juice") || lowerText.includes("juiced")) {
      if (lowerText.includes("plus more") || lowerText.includes("plus extra") || lowerText.includes("and more")) {
        const decimalMatch = text2.match(/^(\d+\.\d+)\s*(\w+)/i);
        if (decimalMatch) {
          quantity = decimalMatch[1];
          name = text2;
          unit = "";
        } else {
          const wholeNumMatch = text2.match(/^(\d+)\s*(\w+)/i);
          if (wholeNumMatch) {
            quantity = wholeNumMatch[1];
            name = text2;
            unit = "";
          }
        }
        return {
          name: text2,
          quantity: quantity || "1",
          unit: ""
        };
      }
      const fractionMatch2 = text2.match(/^[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/);
      if (fractionMatch2) {
        const fractionToDecimal = {
          "\xBD": "0.5",
          "\u2153": "0.33",
          "\u2154": "0.67",
          "\xBC": "0.25",
          "\xBE": "0.75",
          "\u2155": "0.2",
          "\u2156": "0.4",
          "\u2157": "0.6",
          "\u2158": "0.8",
          "\u2159": "0.17",
          "\u215A": "0.83",
          "\u215B": "0.125",
          "\u215C": "0.375",
          "\u215D": "0.625",
          "\u215E": "0.875"
        };
        quantity = fractionToDecimal[fractionMatch2[0]] || "0.5";
        name = text2;
        unit = "";
      } else if (lowerText.match(/^0\.\d+\s*lemon/)) {
        const numMatch = text2.match(/^(0\.\d+)\s*(.+)/i);
        if (numMatch) {
          quantity = numMatch[1];
          name = text2;
          unit = "";
        }
      } else if (/^(one|two|three|four|five|half)\s+/i.test(lowerText)) {
        const textNumbers = {
          "one": "1",
          "two": "2",
          "three": "3",
          "four": "4",
          "five": "5",
          "half": "0.5"
        };
        const textNumMatch = lowerText.match(/^(one|two|three|four|five|half)\s+/i);
        if (textNumMatch) {
          quantity = textNumbers[textNumMatch[1].toLowerCase()];
          name = text2;
          unit = "";
        }
      } else if (lowerText.match(/0\.5\s+lemon/)) {
        quantity = "0.5";
        name = text2.trim();
        unit = "";
      } else if (lowerText.includes("lemon, juiced")) {
        quantity = "0.5";
        name = text2.trim();
        unit = "";
      } else {
        name = text2.trim();
        if (!quantity) quantity = "1";
        unit = "";
      }
    }
  }
  if (name.split(" ").length > 10) {
    return { name: "", quantity: "", unit: "" };
  }
  quantity = quantity.trim();
  unit = unit.trim();
  name = name.trim();
  return {
    name: name || text2,
    quantity: quantity || "1",
    unit: unit || "unit"
  };
}
var storage = {
  // Recipe operations
  async getAllRecipes() {
    const recipesList = await db.query.recipes.findMany({
      orderBy: (0, import_drizzle_orm2.desc)(recipes.created_at),
      with: {
        ingredients: true
      }
    });
    return recipesList;
  },
  async getRecipeById(id) {
    const recipe = await db.query.recipes.findFirst({
      where: (0, import_drizzle_orm2.eq)(recipes.id, id),
      with: {
        ingredients: true
      }
    });
    return recipe || null;
  },
  async createRecipe(recipeData) {
    const ingredients = recipeData.ingredients || [];
    delete recipeData.ingredients;
    const existingRecipes = await db.query.recipes.findMany({
      where: (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(recipes.title, String(recipeData.title || "")),
        (0, import_drizzle_orm2.eq)(recipes.url, recipeData.url || "")
      ),
      with: {
        ingredients: true
      }
    });
    if (existingRecipes.length > 0) {
      return existingRecipes[0];
    }
    const newRecipe = {
      title: String(recipeData.title || ""),
      description: String(recipeData.description || ""),
      prep_time: recipeData.prep_time || 30,
      servings: recipeData.servings || 2,
      difficulty: String(recipeData.difficulty || "Easy"),
      rating: recipeData.rating || 0,
      rating_count: recipeData.rating_count || 0,
      image_url: recipeData.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      url: recipeData.url || "",
      instructions: recipeData.instructions || [],
      storage_instructions: String(recipeData.storage_instructions || ""),
      is_favorite: false,
      cost_per_serving: recipeData.cost_per_serving?.toString() || "0",
      nutrition: recipeData.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      comments: recipeData.comments || []
    };
    const [insertedRecipe] = await db.insert(recipes).values(newRecipe).returning();
    if (ingredients.length > 0) {
      const newIngredients = ingredients.map((ingredient) => ({
        recipe_id: insertedRecipe.id,
        name: String(ingredient.name || ""),
        quantity: String(ingredient.quantity || ""),
        unit: String(ingredient.unit || "")
      }));
      await db.insert(recipeIngredients).values(newIngredients);
    }
    const recipe = await this.getRecipeById(insertedRecipe.id);
    if (!recipe) {
      throw new Error("Failed to create recipe");
    }
    return recipe;
  },
  async updateRecipe(id, recipeData) {
    const ingredients = recipeData.ingredients || [];
    delete recipeData.ingredients;
    await db.update(recipes).set({
      ...recipeData,
      instructions: recipeData.instructions ? JSON.stringify(recipeData.instructions) : void 0,
      nutrition: recipeData.nutrition ? JSON.stringify(recipeData.nutrition) : void 0,
      comments: recipeData.comments ? JSON.stringify(recipeData.comments) : void 0,
      is_favorite: recipeData.is_favorite ? true : false,
      updated_at: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm2.eq)(recipes.id, id));
    if (ingredients.length > 0) {
      await db.delete(recipeIngredients).where((0, import_drizzle_orm2.eq)(recipeIngredients.recipe_id, id));
      await db.insert(recipeIngredients).values(
        ingredients.map((ingredient) => ({
          recipe_id: id,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          created_at: /* @__PURE__ */ new Date()
        }))
      );
    }
    return this.getRecipeById(id);
  },
  async updateRecipeFavorite(id, isFavorite) {
    await db.update(recipes).set({
      is_favorite: isFavorite,
      updated_at: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm2.eq)(recipes.id, id));
  },
  async deleteRecipe(id) {
    await db.delete(recipes).where((0, import_drizzle_orm2.eq)(recipes.id, id));
  },
  async importRecipeFromUrl(url) {
    try {
      console.log(`Fetching recipe data from URL: ${url}`);
      const response = await axios2.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      const html = response.data;
      const $ = cheerio2.load(html);
      console.log(`Successfully loaded HTML from ${url}`);
      let extractedRecipe = {
        url,
        is_favorite: false,
        rating: 0,
        rating_count: 0,
        nutrition: JSON.stringify({ calories: 0, protein: 0, carbs: 0, fat: 0 }),
        instructions: "[]",
        // Initialize as empty JSON array string
        comments: "[]",
        // Initialize as empty JSON array string
        ingredients: []
      };
      const processInstructions = (rawInstructions) => {
        if (Array.isArray(rawInstructions)) {
          return JSON.stringify(rawInstructions.map(String));
        }
        return "[]";
      };
      const processIngredients = (rawIngredients) => {
        return rawIngredients.map((ing) => ({
          name: String(ing?.name || ""),
          quantity: String(ing?.quantity || "1"),
          unit: String(ing?.unit || "unit"),
          recipe_id: null,
          id: 0,
          created_at: /* @__PURE__ */ new Date()
        }));
      };
      const processRecipeData = (rawInstructions, rawIngredients) => {
        extractedRecipe.instructions = processInstructions(rawInstructions);
        extractedRecipe.ingredients = processIngredients(rawIngredients);
      };
      if (url.includes("tasty.co")) {
        console.log("Parsing Tasty.co recipe");
        extractedRecipe.title = $("h1").first().text().trim();
        extractedRecipe.description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || $(".description").first().text().trim();
        extractedRecipe.image_url = $('meta[property="og:image"]').attr("content") || $(".recipe-image img").first().attr("src");
        const instructions = [];
        $(".prep-steps li, .instructions li, .recipe-instructions li").each((i, el) => {
          const text2 = $(el).text().trim();
          if (text2) instructions.push(text2);
        });
        if (instructions.length === 0) {
          $(".preparation-steps p, .instructions p").each((i, el) => {
            const text2 = $(el).text().trim();
            if (text2) instructions.push(text2);
          });
        }
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        const ingredients = [];
        let foundIngredients = false;
        $('[data-ingredient-list-component="true"] li, [data-ingredient-component="true"], [component="ingredient"], .ingredient-item, .ingredients-item').each((i, el) => {
          const text2 = $(el).text().trim();
          foundIngredients = true;
          const parsedIngredient = parseIngredientText(text2);
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        if (!foundIngredients) {
          $('.ingredients-list li, .recipe-ingredients li, .ingredients li, ul.ingredients li, [class*="ingredient"] li, [id*="ingredient"] li').each((i, el) => {
            const text2 = $(el).text().trim();
            const parsedIngredient = parseIngredientText(text2);
            if (parsedIngredient.name) {
              ingredients.push(parsedIngredient);
            }
          });
        }
        const extractJsonIngredients = () => {
          const scriptTags = $('script[type="application/ld+json"]');
          const jsonIngredients = [];
          scriptTags.each((i, script) => {
            try {
              const scriptContent = $(script).html();
              if (scriptContent) {
                const jsonData = JSON.parse(scriptContent);
                if (jsonData && jsonData["@type"] === "Recipe" && jsonData.recipeIngredient) {
                  jsonData.recipeIngredient.forEach((ing) => {
                    const parsedIngredient = parseIngredientText(ing);
                    if (parsedIngredient.name) {
                      jsonIngredients.push(parsedIngredient);
                    }
                  });
                }
                if (jsonData && jsonData["@graph"]) {
                  jsonData["@graph"].forEach((item) => {
                    if (item && item["@type"] === "Recipe" && item.recipeIngredient) {
                      item.recipeIngredient.forEach((ing) => {
                        const parsedIngredient = parseIngredientText(ing);
                        if (parsedIngredient.name) {
                          jsonIngredients.push(parsedIngredient);
                        }
                      });
                    }
                  });
                }
              }
            } catch (e) {
            }
          });
          return jsonIngredients;
        };
        let finalIngredients = [...ingredients];
        if (finalIngredients.length === 0) {
          finalIngredients = extractJsonIngredients();
        } else {
          const jsonIngredients = extractJsonIngredients();
          if (jsonIngredients.length > finalIngredients.length) {
            finalIngredients = jsonIngredients;
          } else if (
            // Check if JSON has ingredients we're clearly missing
            jsonIngredients.some((ing) => ing.name.includes("chicken") || ing.name.includes("lemon") || ing.name.includes("rice")) && // And our scraped list is missing these ingredients
            !finalIngredients.some((ing) => ing.name.includes("chicken") || ing.name.includes("lemon") || ing.name.includes("rice"))
          ) {
            const uniqueIngredients = /* @__PURE__ */ new Map();
            jsonIngredients.forEach((ing) => {
              uniqueIngredients.set(ing.name.toLowerCase(), ing);
            });
            finalIngredients.forEach((ing) => {
              if (!uniqueIngredients.has(ing.name.toLowerCase())) {
                uniqueIngredients.set(ing.name.toLowerCase(), ing);
              }
            });
            finalIngredients = Array.from(uniqueIngredients.values());
          }
        }
        extractedRecipe.ingredients = finalIngredients.map((ing) => ({
          ...ing,
          id: 0,
          created_at: /* @__PURE__ */ new Date(),
          recipe_id: null
        }));
        const prepTimeText = $(".prep-time, .cook-time, .total-time").text();
        const prepTimeMatch = prepTimeText.match(/(\d+)/);
        if (prepTimeMatch) {
          extractedRecipe.prep_time = parseInt(prepTimeMatch[1], 10) || 30;
        }
        const servingsText = $(".servings, .yield").text();
        const servingsMatch = servingsText.match(/(\d+)/);
        if (servingsMatch) {
          extractedRecipe.servings = parseInt(servingsMatch[1], 10) || 4;
        }
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      } else if (url.includes("allrecipes.com")) {
        console.log("Parsing AllRecipes recipe");
        extractedRecipe.title = $("h1").first().text().trim();
        extractedRecipe.description = $('meta[name="description"]').attr("content") || $(".recipe-summary").first().text().trim();
        extractedRecipe.image_url = $('meta[property="og:image"]').attr("content") || $(".recipe-image img, .lead-media img").first().attr("src");
        const instructions = [];
        $(".instructions-section li, .step, .recipe-directions__list li").each((i, el) => {
          const text2 = $(el).text().trim();
          if (text2) instructions.push(text2);
        });
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        const ingredients = [];
        $('.ingredients-section li, .ingredients-item, .recipe-ingredients__list li, [class*="ingredient"] li, [id*="ingredient"] li').each((i, el) => {
          const text2 = $(el).text().trim();
          const parsedIngredient = parseIngredientText(text2);
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        extractedRecipe.ingredients = ingredients.map((ing) => ({
          ...ing,
          id: 0,
          created_at: /* @__PURE__ */ new Date(),
          recipe_id: null
        }));
        const prepTimeText = $(".recipe-meta-item, .recipe-details").text();
        const prepTimeMatch = prepTimeText.match(/(\d+)\s*min/i);
        if (prepTimeMatch) {
          extractedRecipe.prep_time = parseInt(prepTimeMatch[1], 10) || 30;
        }
        const servingsText = $(".recipe-meta-item, .recipe-details").text();
        const servingsMatch = servingsText.match(/Servings:\s*(\d+)/i);
        if (servingsMatch) {
          extractedRecipe.servings = parseInt(servingsMatch[1], 10) || 4;
        }
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      } else {
        console.log("Parsing generic recipe website");
        extractedRecipe.title = $("h1").first().text().trim() || $(".recipe-title").text().trim() || $('meta[property="og:title"]').attr("content") || "Imported Recipe";
        extractedRecipe.description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || $(".recipe-summary, .description").first().text().trim() || `Recipe imported from ${url}`;
        extractedRecipe.image_url = $('meta[property="og:image"]').attr("content") || $(".recipe-image img, .post-image img").first().attr("src") || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
        const instructions = [];
        $(".instructions li, .recipe-instructions li, .directions li, .steps li, .method li").each((i, el) => {
          const text2 = $(el).text().trim();
          if (text2) instructions.push(text2);
        });
        if (instructions.length === 0) {
          $(".instructions p, .recipe-instructions p, .directions p, .steps p, .method p").each((i, el) => {
            const text2 = $(el).text().trim();
            if (text2) instructions.push(text2);
          });
        }
        extractedRecipe.instructions = instructions.length > 0 ? instructions : ["Instructions could not be extracted"];
        const ingredients = [];
        $('.ingredients li, .recipe-ingredients li, .ingredient-list li, [class*="ingredient"] li, [id*="ingredient"] li, .ingredients p, [class*="ingredient"] p, [id*="ingredient"] p').each((i, el) => {
          const text2 = $(el).text().trim();
          const parsedIngredient = parseIngredientText(text2);
          if (parsedIngredient.name) {
            ingredients.push(parsedIngredient);
          }
        });
        if (ingredients.length === 0) {
          const ingredientBlocks = $('.ingredients, [class*="ingredient"], [id*="ingredient"]').text();
          if (ingredientBlocks) {
            const lines = ingredientBlocks.split(/\n|\r/).filter((line) => line.trim().length > 0);
            for (const line of lines) {
              const parsedIngredient = parseIngredientText(line);
              if (parsedIngredient.name) {
                ingredients.push(parsedIngredient);
              }
            }
          }
        }
        extractedRecipe.ingredients = ingredients.length > 0 ? ingredients.map((ing) => ({
          ...ing,
          id: 0,
          created_at: /* @__PURE__ */ new Date(),
          recipe_id: null
        })) : [
          { name: "Ingredients could not be extracted", quantity: "", unit: "", id: 0, created_at: /* @__PURE__ */ new Date(), recipe_id: null }
        ];
        extractedRecipe.prep_time = 30;
        extractedRecipe.servings = 4;
        extractedRecipe.difficulty = "Medium";
        extractedRecipe.storage_instructions = "Store in refrigerator in an airtight container.";
        extractedRecipe.cost_per_serving = "5.00";
        processRecipeData(
          Array.isArray(extractedRecipe.instructions) ? extractedRecipe.instructions : [],
          extractedRecipe.ingredients || []
        );
      }
      console.log(`Successfully extracted recipe: ${extractedRecipe.title}`);
      return await this.createRecipe(extractedRecipe);
    } catch (error) {
      console.error("Error importing recipe:", error);
      return null;
    }
  },
  async compareRecipes(recipe1Id, recipe2Id) {
    const recipe1 = await this.getRecipeById(recipe1Id);
    const recipe2 = await this.getRecipeById(recipe2Id);
    if (!recipe1 || !recipe2) {
      return null;
    }
    const recipe1IngNames = recipe1.ingredients.map((ing) => ing.name.toLowerCase());
    const recipe2IngNames = recipe2.ingredients.map((ing) => ing.name.toLowerCase());
    const commonIngredients = recipe1IngNames.filter((name) => recipe2IngNames.includes(name));
    return {
      recipe1,
      recipe2,
      commonIngredients
    };
  },
  // Inventory operations
  async getAllInventoryItems() {
    return db.query.inventoryItems.findMany({
      orderBy: (0, import_drizzle_orm2.desc)(inventoryItems.created_at)
    });
  },
  async getInventoryItemById(id) {
    const item = await db.query.inventoryItems.findFirst({
      where: (0, import_drizzle_orm2.eq)(inventoryItems.id, id)
    });
    return item || null;
  },
  async getInventoryItemsByCategory(category) {
    if (category === "all") {
      return this.getAllInventoryItems();
    }
    return db.query.inventoryItems.findMany({
      where: (0, import_drizzle_orm2.eq)(inventoryItems.category, category),
      orderBy: (0, import_drizzle_orm2.desc)(inventoryItems.created_at)
    });
  },
  async getInventoryCategories() {
    const items = await db.query.inventoryItems.findMany({
      columns: {
        category: true
      }
    });
    const categories = Array.from(new Set(items.map((item) => item.category || "").filter(Boolean)));
    return categories;
  },
  async getItemByBarcode(barcode) {
    const existingItem = await db.query.inventoryItems.findFirst({
      where: (0, import_drizzle_orm2.eq)(inventoryItems.barcode, barcode)
    });
    if (existingItem) {
      return existingItem;
    }
    try {
      const { lookupBarcodeInfo: lookupBarcodeInfo2 } = await Promise.resolve().then(() => (init_barcode_utils(), barcode_utils_exports));
      const productInfo = await lookupBarcodeInfo2(barcode);
      if (productInfo) {
        return {
          id: 0,
          name: productInfo.name || "",
          image_url: productInfo.image_url || null,
          created_at: /* @__PURE__ */ new Date(),
          updated_at: /* @__PURE__ */ new Date(),
          quantity: productInfo.quantity || "1",
          unit: productInfo.unit || "unit",
          count: productInfo.count || 1,
          barcode,
          location: productInfo.location || "Pantry",
          category: productInfo.category || "Other",
          expiry_date: null
        };
      }
      console.log(`No product information found for barcode ${barcode}`);
      return null;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  },
  async createInventoryItem(itemData) {
    const existingItems = await db.query.inventoryItems.findMany({
      where: (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(inventoryItems.name, String(itemData.name || "")),
        (0, import_drizzle_orm2.eq)(inventoryItems.quantity, String(itemData.quantity || "")),
        (0, import_drizzle_orm2.eq)(inventoryItems.unit, String(itemData.unit || "")),
        (0, import_drizzle_orm2.eq)(inventoryItems.category, String(itemData.category || "")),
        (0, import_drizzle_orm2.eq)(inventoryItems.barcode, itemData.barcode || "")
      )
    });
    if (existingItems.length > 0) {
      return existingItems[0];
    }
    const [insertedItem] = await db.insert(inventoryItems).values({
      name: String(itemData.name || ""),
      quantity: String(itemData.quantity || ""),
      unit: String(itemData.unit || ""),
      count: itemData.count || 1,
      barcode: itemData.barcode || "",
      location: itemData.location || "",
      category: itemData.category || "",
      expiry_date: itemData.expiry_date ? new Date(itemData.expiry_date) : null,
      image_url: itemData.image_url || null,
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    }).returning();
    return insertedItem;
  },
  async updateInventoryItem(id, itemData) {
    await db.update(inventoryItems).set({ ...itemData, updated_at: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(inventoryItems.id, id));
    return this.getInventoryItemById(id);
  },
  async deleteInventoryItem(id) {
    await db.delete(inventoryItems).where((0, import_drizzle_orm2.eq)(inventoryItems.id, id));
  },
  // Shopping list operations
  async getAllShoppingItems() {
    return db.query.shoppingItems.findMany({
      orderBy: (0, import_drizzle_orm2.desc)(shoppingItems.created_at)
    });
  },
  async getShoppingItemById(id) {
    const item = await db.query.shoppingItems.findFirst({
      where: (0, import_drizzle_orm2.eq)(shoppingItems.id, id)
    });
    return item || null;
  },
  async getShoppingItemsByCategory() {
    const items = await db.query.shoppingItems.findMany({
      orderBy: (items2, { asc }) => asc(items2.category)
    });
    const categorizedItems = {};
    items.forEach((item) => {
      const category = item.category || "Other";
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push(item);
    });
    return Object.entries(categorizedItems).map(([category, items2]) => ({
      name: category,
      category,
      items: items2
    }));
  },
  async createShoppingItem(itemData) {
    const existingItems = await db.query.shoppingItems.findMany({
      where: (0, import_drizzle_orm2.and)(
        (0, import_drizzle_orm2.eq)(shoppingItems.name, String(itemData.name || "")),
        (0, import_drizzle_orm2.eq)(shoppingItems.quantity, String(itemData.quantity || "")),
        (0, import_drizzle_orm2.eq)(shoppingItems.unit, String(itemData.unit || "")),
        (0, import_drizzle_orm2.eq)(shoppingItems.category, String(itemData.category || "Other"))
      )
    });
    if (existingItems.length > 0) {
      return existingItems[0];
    }
    const [insertedItem] = await db.insert(shoppingItems).values({
      name: String(itemData.name || ""),
      quantity: String(itemData.quantity || ""),
      unit: String(itemData.unit || "unit"),
      category: String(itemData.category || "Other"),
      checked: false,
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    }).returning();
    return insertedItem;
  },
  async updateShoppingItem(id, itemData) {
    await db.update(shoppingItems).set(itemData).where((0, import_drizzle_orm2.eq)(shoppingItems.id, id));
    return this.getShoppingItemById(id);
  },
  async deleteShoppingItem(id) {
    await db.delete(shoppingItems).where((0, import_drizzle_orm2.eq)(shoppingItems.id, id));
  },
  async clearShoppingList() {
    try {
      await db.delete(shoppingItems);
    } catch (error) {
      console.error("Error in clearShoppingList:", error);
      throw error;
    }
  },
  async addRecipeToShoppingList(recipeId) {
    const recipe = await this.getRecipeById(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      throw new Error("Recipe has no ingredients");
    }
    for (const ingredient of recipe.ingredients) {
      if (!ingredient.name) {
        console.warn(`Skipping invalid ingredient in recipe ${recipeId}:`, ingredient);
        continue;
      }
      try {
        await this.createShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity || "1",
          unit: ingredient.unit || "unit",
          category: this.categorizeIngredient(ingredient.name)
        });
      } catch (error) {
        console.error(`Error adding ingredient ${ingredient.name} to shopping list:`, error);
      }
    }
  },
  // Helper function to categorize ingredients
  categorizeIngredient(ingredientName) {
    const lowerName = ingredientName.toLowerCase();
    if (lowerName.includes("milk") || lowerName.includes("cheese") || lowerName.includes("yogurt")) {
      return "Dairy";
    } else if (lowerName.includes("tomato") || lowerName.includes("lettuce") || lowerName.includes("carrot") || lowerName.includes("onion") || lowerName.includes("pepper") || lowerName.includes("cucumber")) {
      return "Produce";
    } else if (lowerName.includes("chicken") || lowerName.includes("beef") || lowerName.includes("pork") || lowerName.includes("fish") || lowerName.includes("meat")) {
      return "Meat";
    } else if (lowerName.includes("flour") || lowerName.includes("sugar") || lowerName.includes("rice") || lowerName.includes("pasta") || lowerName.includes("oil") || lowerName.includes("vinegar")) {
      return "Pantry";
    } else if (lowerName.includes("salt") || lowerName.includes("pepper") || lowerName.includes("oregano") || lowerName.includes("basil") || lowerName.includes("spice") || lowerName.includes("herb")) {
      return "Spices";
    }
    return "Other";
  },
  async createInventoryItemFromBarcode(barcode) {
    try {
      const response = await axios2.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const productInfo = response.data.product;
      if (!productInfo) {
        return null;
      }
      const newItem = {
        name: productInfo.product_name || "",
        quantity: "1",
        unit: "unit",
        count: 1,
        barcode,
        location: "Pantry",
        category: "Other",
        image_url: productInfo.image_url || null,
        created_at: /* @__PURE__ */ new Date(),
        updated_at: /* @__PURE__ */ new Date()
      };
      const existingItems = await db.select().from(inventoryItems).where((0, import_drizzle_orm2.eq)(inventoryItems.barcode, barcode));
      if (existingItems.length > 0) {
        return existingItems[0];
      }
      const [insertedItem] = await db.insert(inventoryItems).values(newItem).returning();
      return insertedItem;
    } catch (error) {
      console.error("Error creating inventory item from barcode:", error);
      return null;
    }
  },
  async removeDuplicates() {
    try {
      const shoppingItemsList = await db.query.shoppingItems.findMany();
      const uniqueShoppingItems = /* @__PURE__ */ new Map();
      shoppingItemsList.forEach((item) => {
        const key = `${item.name}-${item.quantity}-${item.unit}-${item.category}`;
        if (!uniqueShoppingItems.has(key)) {
          uniqueShoppingItems.set(key, item);
        }
      });
      await db.delete(shoppingItems);
      const uniqueShoppingArray = Array.from(uniqueShoppingItems.values());
      for (const item of uniqueShoppingArray) {
        await db.insert(shoppingItems).values(item);
      }
      const inventoryItemsList = await db.query.inventoryItems.findMany();
      const uniqueInventoryItems = /* @__PURE__ */ new Map();
      inventoryItemsList.forEach((item) => {
        const key = `${item.name}-${item.quantity}-${item.unit}-${item.category}-${item.barcode}`;
        if (!uniqueInventoryItems.has(key)) {
          uniqueInventoryItems.set(key, item);
        }
      });
      await db.delete(inventoryItems);
      const uniqueInventoryArray = Array.from(uniqueInventoryItems.values());
      for (const item of uniqueInventoryArray) {
        await db.insert(inventoryItems).values(item);
      }
      const recipesList = await db.query.recipes.findMany({
        with: {
          ingredients: true
        }
      });
      const uniqueRecipes = /* @__PURE__ */ new Map();
      recipesList.forEach((recipe) => {
        const key = `${recipe.title}-${recipe.url}`;
        if (!uniqueRecipes.has(key)) {
          uniqueRecipes.set(key, recipe);
        }
      });
      await db.delete(recipes);
      const uniqueRecipesArray = Array.from(uniqueRecipes.values());
      for (const recipe of uniqueRecipesArray) {
        await db.insert(recipes).values(recipe);
      }
      console.log("Successfully removed duplicates from all tables");
    } catch (error) {
      console.error("Error removing duplicates:", error);
      throw error;
    }
  },
  // Helper function to convert array to Set
  arrayToSet(arr) {
    return new Set(arr);
  }
};

// server/routes.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var import_drizzle_orm3 = __toESM(require_drizzle_orm(), 1);
init_barcode_utils();
import { networkInterfaces } from "os";
function getLocalIP() {
  const nets = networkInterfaces();
  const results = {};
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;
    for (const net of interfaces) {
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  let ip = null;
  const commonInterfaces = ["en0", "eth0", "wlan0", "Wi-Fi", "Ethernet", "Wireless LAN"];
  for (const iface of commonInterfaces) {
    if (results[iface]?.length > 0) {
      ip = results[iface][0];
      break;
    }
  }
  if (!ip) {
    for (const iface of Object.keys(results)) {
      if (results[iface].length > 0) {
        ip = results[iface][0];
        break;
      }
    }
  }
  return ip || "127.0.0.1";
}
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      const existingUser = await db.query.users.findFirst({
        where: (0, import_drizzle_orm3.eq)(users.username, username)
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db.insert(users).values({ username, password: hashedPassword }).returning();
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await db.query.users.findFirst({
        where: (0, import_drizzle_orm3.eq)(users.username, username)
      });
      if (!user) {
        if (username === "admin" && password === "admin123") {
          const hashedPassword = await bcrypt.hash(password, 10);
          const [newUser] = await db.insert(users).values({ username, password: hashedPassword }).returning();
          const token2 = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });
          return res.json({ user: { id: newUser.id, username: newUser.username }, token: token2 });
        }
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ user: { id: user.id, username: user.username }, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/recipes", async (req, res) => {
    try {
      const recipes2 = await storage.getAllRecipes();
      res.json(recipes2);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });
  app2.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipeById(Number(req.params.id));
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });
  app2.post("/api/recipes", async (req, res) => {
    try {
      const recipe = await storage.createRecipe(req.body);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });
  app2.put("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.updateRecipe(Number(req.params.id), req.body);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });
  app2.put("/api/recipes/:id/favorite", async (req, res) => {
    try {
      await storage.updateRecipeFavorite(Number(req.params.id), req.body.isFavorite);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating favorite status:", error);
      res.status(500).json({ message: "Failed to update favorite status" });
    }
  });
  app2.delete("/api/recipes/:id", async (req, res) => {
    try {
      await storage.deleteRecipe(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });
  app2.post("/api/recipes/import", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      const recipe = await storage.importRecipeFromUrl(url);
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error importing recipe:", error);
      res.status(500).json({ message: "Failed to import recipe" });
    }
  });
  app2.get("/api/recipes/compare", async (req, res) => {
    try {
      const { recipe1Id, recipe2Id } = req.query;
      if (!recipe1Id || !recipe2Id) {
        return res.status(400).json({ message: "Two recipe IDs are required" });
      }
      const id1 = parseInt(recipe1Id);
      const id2 = parseInt(recipe2Id);
      if (isNaN(id1) || isNaN(id2)) {
        return res.status(400).json({ message: "Recipe IDs must be valid numbers" });
      }
      const comparison = await storage.compareRecipes(id1, id2);
      if (!comparison) {
        return res.status(404).json({ message: "One or both recipes not found" });
      }
      res.json(comparison);
    } catch (error) {
      console.error("Error comparing recipes:", error);
      res.status(500).json({ message: "Failed to compare recipes" });
    }
  });
  app2.get("/api/inventory", async (req, res) => {
    try {
      const { category } = req.query;
      let items;
      if (category && category !== "all") {
        items = await storage.getInventoryItemsByCategory(category);
      } else {
        items = await storage.getAllInventoryItems();
      }
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });
  app2.get("/api/inventory/categories", async (req, res) => {
    try {
      const categories = await storage.getInventoryCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching inventory categories:", error);
      res.status(500).json({ message: "Failed to fetch inventory categories" });
    }
  });
  app2.get("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.getInventoryItemById(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });
  app2.get("/api/inventory/barcode/:barcode", async (req, res) => {
    try {
      const item = await storage.getItemByBarcode(req.params.barcode);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item by barcode:", error);
      res.status(500).json({ message: "Failed to fetch item by barcode" });
    }
  });
  app2.post("/api/inventory", async (req, res) => {
    try {
      const item = await storage.createInventoryItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });
  app2.put("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.updateInventoryItem(Number(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });
  app2.delete("/api/inventory/:id", async (req, res) => {
    try {
      await storage.deleteInventoryItem(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });
  app2.get("/api/shopping-list", async (req, res) => {
    try {
      const items = await storage.getAllShoppingItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
      res.status(500).json({ message: "Failed to fetch shopping items" });
    }
  });
  app2.get("/api/shopping-list/categories", async (req, res) => {
    try {
      const categories = await storage.getShoppingItemsByCategory();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching shopping categories:", error);
      res.status(500).json({ message: "Failed to fetch shopping categories" });
    }
  });
  app2.get("/api/shopping-list/:id", async (req, res) => {
    try {
      const item = await storage.getShoppingItemById(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Shopping item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching shopping item:", error);
      res.status(500).json({ message: "Failed to fetch shopping item" });
    }
  });
  app2.post("/api/shopping-list", async (req, res) => {
    try {
      const item = await storage.createShoppingItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating shopping item:", error);
      res.status(500).json({ message: "Failed to create shopping item" });
    }
  });
  app2.put("/api/shopping-list/:id", async (req, res) => {
    try {
      const item = await storage.updateShoppingItem(Number(req.params.id), req.body);
      if (!item) {
        return res.status(404).json({ message: "Shopping item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating shopping item:", error);
      res.status(500).json({ message: "Failed to update shopping item" });
    }
  });
  app2.delete("/api/shopping-list/clear", async (req, res) => {
    try {
      await storage.clearShoppingList();
      res.status(200).json({ success: true, message: "Shopping list cleared successfully" });
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      res.status(500).json({ message: "Failed to clear shopping list" });
    }
  });
  app2.delete("/api/shopping-list/:id", async (req, res) => {
    try {
      await storage.deleteShoppingItem(Number(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting shopping item:", error);
      res.status(500).json({ message: "Failed to delete shopping item" });
    }
  });
  app2.post("/api/shopping-list/from-recipe", async (req, res) => {
    try {
      const { recipeId } = req.body;
      if (!recipeId) {
        return res.status(400).json({ message: "Recipe ID is required" });
      }
      await storage.addRecipeToShoppingList(Number(recipeId));
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error adding recipe to shopping list:", error);
      res.status(500).json({ message: "Failed to add recipe to shopping list" });
    }
  });
  app2.post("/api/shopping-list/bulk-add", async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "Valid ingredients array is required" });
      }
      const addedItems = [];
      for (const ingredient of ingredients) {
        const item = await storage.createShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.category
        });
        addedItems.push(item);
      }
      res.status(201).json({ success: true, addedItems });
    } catch (error) {
      console.error("Error adding ingredients to shopping list:", error);
      res.status(500).json({ message: "Failed to add ingredients to shopping list" });
    }
  });
  app2.get("/api/network-info", (req, res) => {
    try {
      const ipAddress = getLocalIP();
      const serverPort = process.env.PORT || 5e3;
      res.json({
        ipAddress,
        port: serverPort,
        networkURL: `http://${ipAddress}:${serverPort}`
      });
    } catch (error) {
      console.error("Error getting network info:", error);
      res.status(500).json({ message: "Failed to get network information" });
    }
  });
  app2.get("/api/products/lookup", async (req, res) => {
    try {
      const { barcode } = req.query;
      if (!barcode) {
        return res.status(400).json({ message: "Barcode is required" });
      }
      const existingItem = await storage.getItemByBarcode(barcode);
      if (existingItem) {
        console.log(`Found existing inventory item for barcode ${barcode}`);
        return res.json({
          name: existingItem.name,
          quantity: existingItem.quantity,
          unit: existingItem.unit,
          count: existingItem.count,
          expiry_date: existingItem.expiry_date,
          category: existingItem.category,
          location: existingItem.location
        });
      }
      console.log(`No existing item found, performing web lookup for barcode ${barcode}`);
      const productInfo = await lookupBarcodeInfo(barcode);
      if (productInfo) {
        console.log(`Found product from web sources: ${productInfo.name}`);
        return res.json(productInfo);
      } else {
        console.log(`No product information found for barcode ${barcode}`);
        return res.json(null);
      }
    } catch (error) {
      console.error("Error looking up product:", error);
      return res.status(500).json({ message: "Error looking up product" });
    }
  });
  app2.post("/api/cleanup/remove-duplicates", async (req, res) => {
    try {
      await storage.removeDuplicates();
      res.json({ success: true, message: "Successfully removed duplicates from all tables" });
    } catch (error) {
      console.error("Error removing duplicates:", error);
      res.status(500).json({ message: "Failed to remove duplicates" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@db": path.resolve(import.meta.dirname, "db"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import https from "https";
import fs2 from "fs";
import path3 from "path";
import { fileURLToPath } from "url";

// server/db.ts
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
var DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/grocerymanager";
var pool = new Pool({
  connectionString: DATABASE_URL
});
var db2 = drizzle2(pool, { schema: schema_exports });

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function initializeDatabase() {
  try {
    if (!process.env.DATABASE_URL?.includes("postgresql://")) {
      throw new Error("DATABASE_URL must be a PostgreSQL connection string");
    }
    console.log("Using PostgreSQL database");
    const client = await pool.connect();
    try {
      const migrationFile = path3.join(__dirname, "migrations/001_initial_schema.sql");
      const migration = fs2.readFileSync(migrationFile, "utf8");
      await client.query(migration);
      console.log("Database migrations completed successfully");
    } catch (error) {
      console.error("Error running migrations:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  await initializeDatabase();
  const options = {
    key: fs2.readFileSync(path3.join(__dirname, "../certs/key.pem")),
    cert: fs2.readFileSync(path3.join(__dirname, "../certs/cert.pem"))
  };
  const PORT = parseInt(process.env.PORT || "5001", 10);
  const httpsServer = https.createServer(options, app);
  httpsServer.listen(PORT, "0.0.0.0", () => {
    log(`HTTPS Server running on https://localhost:${PORT}`);
    log(`HTTPS Server running on https://192.168.1.210:${PORT}`);
  }).on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      const nextPort = PORT + 1;
      log(`Port ${PORT} is busy, trying ${nextPort}...`);
      httpsServer.listen(nextPort, "0.0.0.0");
    }
  });
})();
