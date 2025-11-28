export const dogsTontoFile = 
`
import main
import cats

package dogs

enum DogSize {
    Small,
    Medium,
    Large
}

// A 'subkind' is a rigid specialization of a 'kind'.
// 'Dog' is a subkind of 'Animal' because every dog is always a dog. And every dog is an animal.
subkind Dog specializes main.Animal {
    size: DogSize
    @historicalDependence [*] -- hasFather -- [1] Dog
    @historicalDependence [*] -- hasMother -- [1] Dog
}

// A disjoint generalization set specifies types 
// that specialize a supertype mutually exclusively, so no Dog is a Cat and vice versa.
disjoint genset AnimalTypes  
    where Dog, cats.Cat specializes main.Animal
`;