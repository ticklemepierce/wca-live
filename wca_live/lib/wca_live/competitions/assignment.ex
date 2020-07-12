defmodule WcaLive.Competitions.Assignment do
  use WcaLive.Schema
  import Ecto.Changeset
  alias WcaLive.Competitions.{Activity, Person}

  @required_fields [:assignment_code]
  @optional_fields [:station_number]

  schema "assignments" do
    field :assignment_code, :string
    field :station_number, :integer

    belongs_to :person, Person
    belongs_to :activity, Activity
  end

  @doc false
  def changeset(assignment, attrs) do
    assignment
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
