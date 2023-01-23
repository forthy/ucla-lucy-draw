// data Tiger = EmployeeId Name
// [Tiger] -> [Tigers]

import { pipe } from 'fp-ts/function'
import * as I from 'fp-ts/Identity'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import * as D from 'fp-ts/Ord'
import * as RA from 'fp-ts/ReadonlyArray'
import { iso, Newtype, prism } from 'newtype-ts'
import { isPositiveInteger } from 'newtype-ts/lib/PositiveInteger'
import { isNonEmptyString as ins } from 'newtype-ts/lib/NonEmptyString'
import { shuffle } from 'radash'

const isNonEmptyString: (str: string) => boolean = (str) => !!str && ins(str)
const isValidId: (n: number) => boolean = (n) => !!n && isPositiveInteger(n)

interface EmployeeId extends Newtype<{ readonly EmployeeId: unique symbol }, number> {}
const employeeIdOf = prism<EmployeeId>(isValidId).getOption
const employeeIdFrom = (id: EmployeeId) => iso<EmployeeId>().unwrap(id)

interface Name extends Newtype<{ readonly Name: unique symbol }, string> {}
const nameOf = prism<Name>(isNonEmptyString).getOption
const nameIsoOf: (s: string) => O.Option<Name> = (s) => pipe(s, O.fromPredicate(isNonEmptyString), O.map(iso<Name>().wrap))

// data Tiger = EmployeeId Name
type Tiger = Readonly<{ employeeId: EmployeeId; name: Name }>
const buildTiger: (eId: EmployeeId) => (name: Name) => Readonly<Tiger> = (employeeId) => (name) => ({ employeeId, name })
const tigerOf: (employeeIdOpt: O.Option<EmployeeId>) => (nameOpt: O.Option<Name>) => O.Option<Tiger> = (eo) => (no) =>
  pipe(O.of(buildTiger), O.ap(eo), O.ap(no))

// Sorting  
const byEmployeeId: D.Ord<Tiger> = pipe(
  N.Ord,
  D.contramap((tiger) => employeeIdFrom(tiger.employeeId))
)

// Functions
const lucyDraw: (tigers: ReadonlyArray<Tiger>) => ReadonlyArray<Tiger> = (tigers) => shuffle(tigers)
const sortByEmployeeId: (tigers: ReadonlyArray<Tiger>) => ReadonlyArray<Tiger> = (tigers) => RA.sortBy([byEmployeeId])(tigers)
const presentIndexWith: (tigers: ReadonlyArray<Tiger>) => ReadonlyArray<[number, Name]> = (t) =>
  pipe(
    t,
    RA.traverseWithIndex(I.Applicative)((i, t) => [i + 1, t.name])
  )

// ----- test ------------------------------------------------------  
const Richard = tigerOf(employeeIdOf(118529))(nameOf('Richard'))
const Jane = tigerOf(employeeIdOf(117522))(nameOf('Jane'))
const John = tigerOf(employeeIdOf(125323))(nameOf('John'))

const tigers = O.sequenceArray([Richard, Jane, John])

console.log(
  JSON.stringify(
    pipe(
      tigers,
      O.map((t) => pipe(t, sortByEmployeeId, lucyDraw, presentIndexWith))
    )
  )
)
