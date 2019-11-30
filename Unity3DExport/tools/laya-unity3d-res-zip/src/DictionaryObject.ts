
type MKey = string | number;

interface DictionaryObject<K, T>
{
    [ key : number ] : T;
    [ key : string ] : T;
}