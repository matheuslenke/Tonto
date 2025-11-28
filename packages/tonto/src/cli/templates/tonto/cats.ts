export const catsTontoFile = 
`
import main

package cats

// A 'subkind' is a rigid specialization of a 'kind'.
// 'Cat' is a subkind of 'Animal' because a cat is always an animal.
subkind Cat specializes main.Animal {
    isDeclawed: boolean
}

// A 'phase' is a contingent and intrinsic specialization of a 'kind'.
// 'Kitten' is a phase of 'Cat' because a cat is a kitten for a period of time.
phase Kitten specializes Cat {}

// 'AdultCat' is a phase of 'Cat' because a cat is an adult cat for a period of time.
phase AdultCat specializes Cat {}

// A disjoint and complete generalization set specifies types 
// that partition a supertype exhaustively and mutually exclusively 
disjoint complete genset CatPhases 
    where Kitten, AdultCat specializes Cat 

`;