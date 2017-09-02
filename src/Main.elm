module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, href, style)
import Material
import Material.Scheme
import Material.Options as Options exposing (cs, css)
import Material.Card as Card
import Material.Button as Button 
import Material.Icon as Icon
import Material.Color as Color exposing (Color)
import Material.Elevation as Elevation


-- MODEL


type alias Model =
    { mdl : Material.Model
    , userCell : CellModel
    , twitterCell : CellModel
    , githubCell : CellModel
    , facebookCell : CellModel
    , wishlistCell : CellModel
    }


model : Model
model =
    { mdl = Material.model
    , userCell =
        { raised = False
        , image = "https://www.gravatar.com/avatar/107c8aa13ba2d660df1e27614c843f75?size=512"
        , cellType = UserCellType
        , url = "https://oppai.github.io"
        , color = Color.color Color.BlueGrey Color.S700
        }
    , twitterCell =
        { raised = False
        , image = "/images/twitter.png"
        , cellType = TwitterCellType
        , url = "https://twitter.com/kodam"
        , color = Color.color Color.Blue Color.S50
        }
    , githubCell =
        { raised = False
        , image = "/images/github.png"
        , cellType = GithubCellType
        , url = "https://github.com/oppai"
        , color = Color.color Color.Pink Color.S200
        }
    , facebookCell =
        { raised = False
        , image = "/images/facebook.png"
        , cellType = FacebookCellType
        , url = "https://www.facebook.com/hiroaki.murayama.399"
        , color = Color.color Color.Teal Color.S300
        }
    , wishlistCell =
        { raised = False
        , image = "/images/amazon.png"
        , cellType = WishlistCellType
        , url = "http://www.amazon.co.jp/registry/wishlist/21DI5R3QOUBXI/"
        , color = Color.color Color.Amber Color.S300
        }
    }

type alias CellModel =
    { raised : Bool
    , image : String
    , cellType : CellType
    , url : String
    , color : Color
    }


white : Options.Property c m
white =
    Color.text Color.white

margin1 : Options.Property a b
margin1 = 
      css "margin" "0"

margin2 : Options.Property a b
margin2 = 
      css "margin" "4px 8px 4px 0px"


-- ACTION, UPDATE


type Msg
    = Mdl (Material.Msg Msg)
    | Raise CellType Bool

type CellType
    = UserCellType
    | TwitterCellType
    | GithubCellType
    | FacebookCellType
    | WishlistCellType


-- Boilerplate: Msg clause for internal Mdl messages.


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- Boilerplate: Mdl action handler.
        Mdl msg_ ->
            Material.update Mdl msg_ model
        Raise UserCellType raised ->
            let
                usercell = model.userCell
                newCell = { usercell | raised = raised }
            in
                ( { model | userCell = newCell }, Cmd.none )
        Raise TwitterCellType raised ->
            let
                twittercell = model.twitterCell
                newCell = { twittercell | raised = raised }
            in
                ( { model | twitterCell = newCell }, Cmd.none )
        Raise GithubCellType raised ->
            let
                githubcell = model.githubCell
                newCell = { githubcell | raised = raised }
            in
                ( { model | githubCell = newCell }, Cmd.none )
        Raise FacebookCellType raised ->
            let
                facebookcell = model.facebookCell
                newCell = { facebookcell | raised = raised }
            in
                ( { model | facebookCell = newCell }, Cmd.none )
        Raise WishlistCellType raised ->
            let
                wishlistcell = model.wishlistCell
                newCell = { wishlistcell | raised = raised }
            in
                ( { model | wishlistCell = newCell }, Cmd.none )



-- VIEW


type alias Mdl =
    Material.Model

view : Model -> Html Msg
view model =
    Options.div
        [ cs "mdl-layout__content"
        , css "margin-left" "50px"
        ]
        [ Html.h3 [] [ Html.text "Oppai's profile page" ]
        , Options.div
            []
            [ Options.div [ css "display" "flex"
                          ]
                          [ Options.div []
                                        [ userCellView model.userCell ]
                          , Options.div [ css "align-content" "flex-start"
                                        , css "flex-wrap" "wrap"
                                        , css "display" "flex"
                                        , css "width" "320px"
                                        ]
                                        [ linkCellView model.twitterCell
                                        , linkCellView model.githubCell
                                        , linkCellView model.facebookCell
                                        , linkCellView model.wishlistCell
                                        ]
                          ]
            , Options.div []
                          []
            ]
        ]
        |> Material.Scheme.top


userCellView : CellModel -> Html Msg
userCellView model =
    let
        width = "264px"
        height = "264px"
    in
        Card.view
            [ css "width" width
            , css "height" height
            , margin2
            , Color.background model.color
            -- Elevation
            , if model.raised then Elevation.e8 else Elevation.e2
            , Elevation.transition 250
            , Options.onMouseEnter (Raise model.cellType True)
            , Options.onMouseLeave (Raise model.cellType False)
            ]
            [ Card.media 
                [ css "background" ("url('" ++ model.image ++ "') center / cover")
                , css "height" height
                ]
                []
            , Card.title [ css "height" "64px" ] 
                [ Card.head [ white ] [ text "oppai a.k.a. kodam" ] 
                ]
            ]

linkCellView : CellModel -> Html Msg
linkCellView model =
    let
        width = "128px"
        height = "128px"
        thumb_width = "96px"
        thumb_height = "96px"
    in
        Card.view
            [ css "width" width
            , Color.background model.color
            , if model.raised then Elevation.e8 else Elevation.e2
            , if model.raised then Elevation.e8 else Elevation.e2
            , Elevation.transition 250
            , Options.onMouseEnter (Raise model.cellType True)
            , Options.onMouseLeave (Raise model.cellType False)
            , margin2
            ]
            [ Card.title 
                [ css "align-content" "flex-start" 
                , css "flex-direction" "row" 
                , css "align-items" "flex-start"
                , css "justify-content" "space-between"
                ] 
                [ Html.a [ href model.url ]
                        [
                            Options.img 
                            [ Options.attribute <| Html.Attributes.src model.image
                            , css "height" thumb_height
                            , css "width" thumb_width
                            ]
                            []
                        ]
                ]
            ]


-- do here, but rather in your master .html file. See the documentation
-- for the `Material` module for details.


main : Program Never Model Msg
main =
    Html.program
        { init = ( model, Cmd.none )
        , view = view
        , subscriptions = always Sub.none
        , update = update
        }
