import { describe, it, expect, beforeEach } from 'vitest'
import {
  Entity,
  Fields,
  FindFirstOptions,
  FindOptions,
  InMemoryDataProvider,
  Remult,
  getEntityRef,
} from '../../../core'
import type { ClassType } from '../../../core/classType'

@Entity('company')
class Company {
  @Fields.integer()
  id = 0
  @Fields.string()
  name = ''
}

@Entity('categories')
class Category {
  @Fields.integer()
  id = 0
  @Fields.string()
  name = ''
  @Fields.reference(() => Company, {
    defaultIncluded: true,
  })
  company: Company

  @Fields.integer()
  secondCompanyId = 0
  @Fields.one(Category, () => Company, {
    field: 'secondCompanyId',
    defaultIncluded: true,
  })
  secondCompany: Company
  @Fields.many(() => Task, {
    field: 'category',
    defaultIncluded: true,
  })
  tasks: Task[]
}

@Entity('tasks')
class Task {
  @Fields.integer()
  id = 0
  @Fields.string()
  title = ''
  @Fields.boolean()
  completed = false
  @Fields.reference(() => Category)
  category!: Category
}
describe('test repository relations', () => {
  let remult: Remult
  function r<entityType>(entity: ClassType<entityType>) {
    return remult.repo(entity)
  }
  beforeEach(async () => {
    remult = new Remult(new InMemoryDataProvider())
    const c = await r(Category).insert({
      id: 1,
      name: 'cat1',
      company: await r(Company).insert({ id: 11, name: 'comp1' }),
      secondCompanyId: (await r(Company).insert({ id: 12, name: 'comp2' })).id,
    })
    await r(Task).insert({ id: 101, title: 'task1', category: c })
    remult.clearAllCache()
  })
  it('loads', async () => {
    const c = await r(Category).findFirst()
    expect(c.company.id).toBe(11)
    expect(c.secondCompany.name).toBe('comp2')
    expect(c.tasks.length).toBe(1)
  })
  it("doesn't loads", async () => {
    const c = await r(Category).findFirst({}, { include: {} })
    expect(c.company).toBeUndefined()
    expect(c.secondCompany).toBeUndefined()
    expect(c.tasks).toBeUndefined()
  })
  it('find one works', async () => {
    const c = await r(Category).findFirst({}, { include: {} })
    expect(getEntityRef(c).fields.company.getId()).toBe(11)
    const comp1 = await r(Category).relations(c).company.findOne()
    const comp2 = await r(Category).relations(c).secondCompany.findOne()

    expect(comp1.id).toBe(11)
    expect(comp2.id).toBe(12)
    expect(await r(Category).relations(c).tasks.count()).toBe(1)
  })
})
