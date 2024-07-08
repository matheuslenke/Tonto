import 'terminals'
import 'class-declaration'

TontoDiagramView:
    'diagram' id=ID '{'
    ('name' ':' name=STRING)?
    ('description' ':' description=STRING)?
    ('nodes' ':' '[' nodes+=NodeView (',' nodes+=NodeView)* ']')?
    '}'
;

NodeView:
    "{"
        'id' ':' id=ID
        'entity' ':' entity=[ClassDeclaration:ID] 
        'x' ':' x=INT
        'y' ':' y=INT
        'width' ':' width=INT
        'height' ':' height=INT
    "}"
;