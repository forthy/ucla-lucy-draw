// happy coding 👻
console.log('hello world')

// data Tiger = EmployeeId Name
// [Tiger] -> [Tigers]

import { Newtype, prism, iso } from 'newtype-ts'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { shuffle } from 'radash'

const isNonEmptyString: (str: string) => boolean = (str) => str !== '' && str !== null && str !== undefined

interface EmployeeId extends Newtype<{ readonly EmployeeId: unique symbol }, string> {}

const employeeIdOf = prism<EmployeeId>(isNonEmptyString).getOption
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

console.log(JSON.stringify(employeeIdOf('')))
console.log(JSON.stringify(nameOf('Richard Chuo')))
console.log(`nameIsoOf: ${JSON.stringify(nameIsoOf(''))}`)
console.log(`nameIsoOf: ${JSON.stringify(nameIsoOf('Richard'))}`)
console.log(JSON.stringify(tigerOf(employeeIdOf('118520'))(nameOf('Richard Chuo'))))
console.log(JSON.stringify(tigerOf(employeeIdOf('118520'))(nameOf(''))))

const lucyDraw: (tigers: Readonly<Array<Tiger>>) => Array<Tiger> = (tigers) => shuffle(tigers)

const Richard = tigerOf(employeeIdOf('118529'))(nameOf('Richard'))
const Jane = tigerOf(employeeIdOf('117522'))(nameOf('Jane'))
const John = tigerOf(employeeIdOf('125323'))(nameOf('John'))

const tigers = O.sequenceArray([Richard, Jane, John])
//    ^?

console.log(JSON.stringify(pipe(tigers, O.map(lucyDraw))))
//                                        ^?