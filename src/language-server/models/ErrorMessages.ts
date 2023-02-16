export enum ErrorMessages {
    cyclicSpecialization = "There is a ciclic specialization. Please review all Elements specializations and generalizationSets from your model",
    ultimateSortalSpecializesUltimateSortal = "Classes representing ultimate sortals cannot specialize other ultimate sortals",
    sortalSpecializesUniqueUltimateSortal = "Every sortal class must specialize a unique Ultimate Sortal (kind, collective, quantity, relator, quality, mode, intrinsicMode or extrinsicMode)",
    sortalSpecializeNoUltimateSortal = "This class does not specialize a Ultimate Sortal. Every sortal class must specialize a unique Ultimate Sortal (kind, collective, quantity, relator, quality, mode, intrinsicMode or extrinsicMode)",
    rigidSpecializeAntiRigid = "Prohibited specialization: rigid/semi-rigid specializing an anti-rigid. The rigid/semi-rigid class ${classDeclaration.name} cannot specialize the anti-rigid class ${specDeclaration.name}",
    genSetSpecialization = "Prohibited generalization: Generalizations must exclusively involve classes or relations, never a combination.",
    genSetCircularGeneralization = "Prohibited generalization: circular generalization. Generalizations must be defined between two distinct classes/relations"
}
