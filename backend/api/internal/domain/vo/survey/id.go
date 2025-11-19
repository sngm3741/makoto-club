package survey

type ID interface {
	Validate() bool
}

type id struct {
	value string
}

func NewID(value string) ID {
	return &id{value}
}

func (o id) Validate() bool {
	return o.value == ""
}
