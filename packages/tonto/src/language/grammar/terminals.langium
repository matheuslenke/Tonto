hidden terminal WS: /\s+/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

// IDs
terminal CAMEL_CASE_ID: /[a-z]([a-zA-Z0-9_]*)/;
terminal CAPITALIZED_ID: /[A-Z]([a-zA-Z0-9_]*)/;
terminal ID: /[_a-zA-Z][\w_]*/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

NAME returns string:
    ID | STRING | CAMEL_CASE_ID | CAPITALIZED_ID
;

QualifiedName returns string:
	NAME ('.' NAME)*
;