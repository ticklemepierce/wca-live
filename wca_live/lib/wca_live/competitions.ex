defmodule WcaLive.Competitions do
  import Ecto.Query, warn: false
  alias WcaLive.Repo
  alias WcaLive.Wcif
  alias WcaLive.Wca
  alias WcaLive.Accounts.User
  alias WcaLive.Competitions.{Competition, Round, Person, CompetitionBrief}

  @doc """
  Returns the list of projects.
  """
  def list_competitions() do
    Repo.all(Competition)
  end

  @doc """
  Gets a single competition.
  """
  def get_competition(id), do: Repo.get(Competition, id)

  @doc """
  Gets a single competition.
  """
  def get_competition!(id), do: Repo.get!(Competition, id)

  @doc """
  Gets a single round.
  """
  def get_round(id), do: Repo.get(Round, id)

  @doc """
  Gets a single person.
  """
  def get_person(id), do: Repo.get(Person, id)

  def import_competition(wca_id, user) do
    user = user |> Repo.preload(:access_token)

    with {:ok, wcif} <- Wca.Api.get_wcif(wca_id, user.access_token.access_token) do
      %Competition{}
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:imported_by, user)
      |> Wcif.Import.import_competition(wcif)
    end
  end

  def synchronize_competition(competition) do
    competition = competition |> Repo.preload(imported_by: [:access_token])
    %{wca_id: wca_id, imported_by: imported_by} = competition

    with {:ok, wcif} <- Wca.Api.get_wcif(wca_id, imported_by.access_token.access_token) do
      Wcif.Import.import_competition(competition, wcif)
    end

    # TODO: save synchronized WCIF back to the WCA website (resutls part).
  end

  @spec get_importable_competition_briefs(%User{}) :: list(CompetitionBrief.t())
  def get_importable_competition_briefs(user) do
    user = user |> Repo.preload(:access_token)
    {:ok, data} = Wca.Api.get_upcoming_manageable_competitions(user.access_token.access_token)

    competition_briefs =
      data
      |> Enum.filter(fn data -> data["announced_at"] != nil end)
      |> Enum.map(&CompetitionBrief.from_wca_json/1)

    wca_ids = Enum.map(competition_briefs, & &1.wca_id)

    imported_wca_ids =
      Repo.all(from c in Competition, where: c.wca_id in ^wca_ids, select: c.wca_id)

    Enum.filter(competition_briefs, fn competition ->
      competition.wca_id not in imported_wca_ids
    end)
  end
end
