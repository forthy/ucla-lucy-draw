// happy coding 👻
console.log('hello world')

// data Tiger = EmployeeId Name
// [Tiger] -> [Tigers]

import { Newtype, prism, iso } from 'newtype-ts'
import * as O from 'fp-ts/Option'
import * as D from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'
import * as B from 'fp-ts/boolean'
import * as N from 'fp-ts/number'
import * as TP from 'ts-pattern'
import * as A from 'fp-ts/Array'
import * as I from 'fp-ts/Identity'
import * as MO from 'monocle-ts'
import { shuffle } from 'radash'

const isNonEmptyString: (str: string) => boolean = (str) => str !== '' && str !== null && str !== undefined
const isValidId: (n: number) => boolean = (n) => n > 0 && n !== null && n !== undefined

interface EmployeeId extends Newtype<{ readonly EmployeeId: unique symbol }, number> {}

const employeeIdOf = prism<EmployeeId>(isValidId).getOption
//    ^?

const employeeIdFrom = (id: EmployeeId) => iso<EmployeeId>().unwrap(id)
//    ^?

interface Name extends Newtype<{ readonly Name: unique symbol }, string> {}

const nameOf = prism<Name>(isNonEmptyString).getOption
//    ^?
const nameIsoOf: (s: string) => O.Option<Name> = (s) => pipe(s, O.fromPredicate(isNonEmptyString), O.map(iso<Name>().wrap))
//    ^?

type Tiger = Readonly<{ employeeId: EmployeeId; name: Name }>
//   ^?

const buildTiger: (eId: EmployeeId) => (name: Name) => Readonly<Tiger> = (employeeId) => (name) => ({ employeeId, name })
const tigerOf: (employeeIdOpt: O.Option<EmployeeId>) => (nameOpt: O.Option<Name>) => O.Option<Tiger> = (eo) => (no) =>
  pipe(O.of(buildTiger), O.ap(eo), O.ap(no))

const byEmployeeId: D.Ord<Tiger> = pipe(
  N.Ord,
  D.contramap((tiger) => employeeIdFrom(tiger.employeeId))
)

// DEBUG
console.log(JSON.stringify(employeeIdOf(-1)))
console.log(JSON.stringify(employeeIdOf(0)))
console.log(JSON.stringify(nameOf('Richard Chuo')))
console.log(`nameIsoOf: ${JSON.stringify(nameIsoOf(''))}`)
console.log(`nameIsoOf: ${JSON.stringify(nameIsoOf('Richard'))}`)
console.log(JSON.stringify(tigerOf(employeeIdOf(118520))(nameOf('Richard Chuo'))))
console.log(JSON.stringify(tigerOf(employeeIdOf(118520))(nameOf(''))))

// Functions
const lucyDraw: (tigers: ReadonlyArray<Tiger>) => ReadonlyArray<Tiger> = (tigers) => shuffle(tigers)
const sortByEmployeeId: (tigers: ReadonlyArray<Tiger>) => ReadonlyArray<Tiger> = (tigers) =>
  A.sortBy([byEmployeeId])(tigers as Array<Tiger>)
const presentIndexWith: (tigers: ReadonlyArray<Tiger>) => ReadonlyArray<[number, Name]> = (t) =>
  pipe(
    t as Array<Tiger>,
    A.traverseWithIndex(I.Applicative)((i, t) => [i + 1, t.name])
  )

const Richard = tigerOf(employeeIdOf(118529))(nameOf('Richard'))
const Jane = tigerOf(employeeIdOf(117522))(nameOf('Jane'))
const John = tigerOf(employeeIdOf(125323))(nameOf('John'))

const tigers = O.sequenceArray([Richard, Jane, John])
//    ^?

console.log(
  JSON.stringify(
    pipe(
      tigers,
      O.map((t) => pipe(t, sortByEmployeeId, lucyDraw, presentIndexWith))
    )
  )
)
