import { Filter, EntityWhere, FindOptions, Repository, EntityMetadata, FilterFactories, AndFilter } from "remult";


export class Lookup<entityType> {

  constructor(private repository: Repository<entityType>) {


  }


  private cache = new Map<string, lookupRowInfo<entityType>>();

  get(filter: EntityWhere<entityType>): entityType {
    return this.getInternal(filter).value;
  }
  getId(id: any): entityType {
    return this.getInternal(() => this.repository.metadata.idMetadata.getIdFilter(id)).value;
  }
  found(filter: EntityWhere<entityType>): boolean {
    return this.getInternal(filter).found;
  }

  private getInternal(where: EntityWhere<entityType>): lookupRowInfo<entityType> {
    return this._internalGetByOptions({ where });
  }

  _internalGetByOptions(find: FindOptions<entityType>): lookupRowInfo<entityType> {
    let f = Filter.packToRawWhere(translateWhereToFilter(Filter.createFilterFactories(this.repository.metadata), find.where));
    let key = JSON.stringify(f);
    let res = this.cache.get(key);
    if (res !== undefined) {
      if (this.repository.getEntityRef(res.value).wasDeleted()) {
        res = undefined;
        this.cache.set(key, undefined);
      } else
        return this.cache.get(key);
    }
    res = new lookupRowInfo<entityType>();
    res.value = <entityType>this.repository.create();
    __updateEntityBasedOnWhere(this.repository.metadata, find.where, res.value);
    this.cache.set(key, res);
    let foundNonUnDefined = false;
    for (const key in f) {
      if (Object.prototype.hasOwnProperty.call(f, key)) {
        const element = f[key];
        if (element !== undefined) {
          foundNonUnDefined = true;
          break;
        }
      }
    }
    if (find == undefined || key == undefined || !foundNonUnDefined) {
      res.loading = false;
      res.found = false;
      res.promise = Promise.resolve(res);
      return res;
    } else {

      res.promise = this.repository.find(find).then(r => {
        res.loading = false;
        if (r.length > 0) {
          res.value = r[0];
          res.found = true;
        }
        return res;
      });
    }
    return res;

  }

  getAsync(filter: EntityWhere<entityType>) {
    return this.getInternal(filter).promise.then(r => r.value);
  }
}

export class lookupRowInfo<type> {
  found = false;
  loading = true;
  value: type = {} as type;
  promise: Promise<lookupRowInfo<type>>
}
function __updateEntityBasedOnWhere<T>(entityDefs: EntityMetadata<T>, where: EntityWhere<T>, r: T) {
  let w = translateWhereToFilter(Filter.createFilterFactories(entityDefs), where);

  if (w) {
    w.__applyToConsumer({
      databaseCustom: () => { },
      custom: () => { },
      containsCaseInsensitive: () => { },
      isDifferentFrom: () => { },
      isEqualTo: (col, val) => {
        r[col.key] = val;
      },
      isGreaterOrEqualTo: () => { },
      isGreaterThan: () => { },
      isIn: () => { },
      isLessOrEqualTo: () => { },
      isLessThan: () => { },
      isNotNull: () => { },
      isNull: () => { },
      startsWith: () => { },
      or: () => { }
    });
  }
}

function translateWhereToFilter<T>(entity: FilterFactories<T>, where: EntityWhere<T>): Filter {
  if (Array.isArray(where)) {
    return new AndFilter(...where.map(x =>
      translateWhereToFilter(entity, x)
    ));
  }
  else if (typeof where === 'function') {
    let r = where(entity);
    if (Array.isArray(r))
      return new AndFilter(
        //@ts-ignore
        ...r.map(x => {
          if (typeof x === "function")
            return this.translateWhereToFilter(entity, x);
          return x
        }));
    else if (typeof r === 'function')
      return this.translateWhereToFilter(entity, r);
    if (r instanceof Promise)
      throw "lookup doesn't support where with promise in it"
    return r;
  }
}