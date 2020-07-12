defmodule WcaLive.Scoretaking.Attempt do
  use WcaLive.Schema
  import Ecto.Changeset

  @required_fields [:result]
  @optional_fields [:reconstruction]

  @primary_key false
  embedded_schema do
    field :result, :integer
    field :reconstruction, :string
  end

  @doc false
  def changeset(attempt, attrs) do
    attempt
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
