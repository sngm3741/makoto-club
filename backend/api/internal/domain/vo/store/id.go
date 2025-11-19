package store

type ID interface {
	Value() string
	Equals(ID) bool
	Validate() bool
}

type id struct {
	value string
}

func NewID(input string) ID {
	return id{value: input}
}

func (o id) Value() string {
	return o.value
}

func (o id) Equals(other ID) bool {
	if other == nil {
		return false
	}

	return o.value == other.Value()
}

func (o id) Validate() bool {
	return o.value == ""
}
