# Welcome to your new Tonto project: {{projectName}}!

This is a sample project to help you get started with Tonto.

## What is Tonto?

Tonto is a textual modeling language for creating well-founded ontologies based on the Unified Foundational Ontology (UFO).

## Getting Started

A Tonto project is defined by a `tonto.json` file, which contains the project's metadata. The ontology models are defined in `.tonto` files, which are located in the `src` directory.

### Packages

Each `.tonto` file represents a package. A package is a container for ontology elements.

To declare a package, use the `package` keyword at the top of your file:
```tonto
package animals
```

### Classes

Classes represent concepts in your domain. You can define classes using stereotypes like `kind`, `subkind`, `phase`, and `role`.

Here's an example of a `kind` class:
```tonto
// Kinds are rigid types that provide an identity principle for their instances.
// 'Animal' is a kind because being an animal is a fundamental and permanent characteristic.
kind Animal {
    // Attributes define the properties of a class.
    // Here, every animal has a birthDate.
    birthDate: date
}
```

You can also create specializations using `subkind`:
```tonto
// Subkinds are rigid specializations of a kind.
// 'Cat' and 'Dog' are subkinds of 'Animal' because they represent more specific, permanent types of animals.
subkind Cat specializes Animal { }
subkind Dog specializes Animal { }
```

### Datatypes

You can define your own datatypes or use the built-in ones (`string`, `number`, `boolean`, `date`, `time`, `datetime`).

Here's an example of a custom datatype:
```tonto
datatype OwnerDetails {
    name: string
    address: string
}
```

### Relations

Relations define how classes are associated with each other.

Here's an example of a relation between `Cat` and a `Person` class (assuming `Person` is defined elsewhere):
```tonto
// This defines a one-to-many relationship where a Person can own multiple cats,
// but each Cat is owned by exactly one Person.
relation Cat [1] -- isOwnedBy -- [0..*] Person
```

## CLI Usage

The Tonto CLI provides several commands to help you manage your project.

### init

Initializes a new Tonto project.
```bash
tonto-cli init
```

### generate

Generates a JSON representation of your Tonto project.
```bash
tonto-cli generate .
```

### validate

Validates your Tonto project.
```bash
tonto-cli validate .
```

## Example Project

This project contains a simple ontology about animals. You can find the models in the `src` directory. Feel free to modify and expand it!


## Cursor rules

This project contains Cursor rules that are specialized with helping AI Agents to build, refine and validate your ontology. They are present in the `.cursor/rules`folder. Remember that this folder needs to be at the root of your workspace.
