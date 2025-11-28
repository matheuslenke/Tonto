export const mainTontoFile = 
`
package main

// A 'kind' is a rigid type that provides an identity principle for its instances.
// 'Animal' is a 'kind' because being an animal is a fundamental and permanent characteristic.
kind Animal {
    birthDate: date {const}     // The birth date of the animal is an immutable attribute.
    weightInKg : number
}

// 'Person' is a 'kind'. All kinds are disjoint, hence, in this model,
// no person is an animal, and vice-versa.
kind Person {
    name: string
}

// A 'role' is a contingent and relational specialization of a 'kind'.
// 'Pet' is a role of 'Animal'. An animal is a 'Pet' in the context of an 'Adoption'.
role Pet specializes Animal {}

// A 'relator' is a truth-maker for a material relation, connecting multiple entities.
// Every 'Adoption' is a relator that connects an 'Animal' with a 'Person'.
relator Adoption {
    // A 'mediation' is a relation that connects a 'relator' to an entity on which the relator depends.
    @mediation [1..*] -- involvesPet -- [1] Pet
    @mediation [0..*] -- involvesAdopter -- [1] Person
}
`;