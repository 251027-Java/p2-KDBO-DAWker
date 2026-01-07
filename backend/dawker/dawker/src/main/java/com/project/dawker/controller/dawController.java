package com.project.dawker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.dawker.dto.dawDTO;
import com.project.dawker.dto.forumPostDTO;
import com.project.dawker.dto.ratingsPageDTO;
import com.project.dawker.dto.userDTO;
import com.project.dawker.dto.recievedDto.receivedCommentDTO;
import com.project.dawker.dto.recievedDto.receivedForumDTO;
import com.project.dawker.dto.recievedDto.recievedLoginRequest;
import com.project.dawker.dto.recievedDto.recievedRatingsCommentDTO;
import com.project.dawker.dto.recievedDto.recievedSessionNotesDTO;
<<<<<<< HEAD
=======
import com.project.dawker.entity.User;
>>>>>>> main
import com.project.dawker.entity.daw_specific.RatingsComment;
import com.project.dawker.entity.daw_specific.RatingsPage;
import com.project.dawker.repository.RatingsCommentRepository;
import com.project.dawker.repository.RatingsPageRepository;
import com.project.dawker.service.DawService;
import com.project.dawker.service.RatingsPageService;
import com.project.dawker.service.forumService;
import com.project.dawker.service.sessionNotesService;
import com.project.dawker.service.useService;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.List;

// DAW CONTROLLER PRANAV!!!!
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class dawController {

    private final DawService dawService;
    private final useService useService;
    private final forumService forumService;
    private final RatingsPageService ratingsService;
    private final RatingsPageRepository ratingsRepo;
    private final RatingsCommentRepository ratingsCommentRepo;
    private final sessionNotesService notesService;

    public dawController(DawService dawService,
            useService useService,
            forumService forumService,
            RatingsPageService ratingsService,
            RatingsPageRepository ratingsRepo,
            RatingsCommentRepository ratingsCommentRepo,
            sessionNotesService notesService) {
        this.dawService = dawService;
        this.useService = useService;
        this.forumService = forumService;
        this.ratingsService = ratingsService;
        this.ratingsRepo = ratingsRepo;
        this.ratingsCommentRepo = ratingsCommentRepo;
        this.notesService = notesService;
    }

    // ------------------ GET METHODS ------------------
    @Operation(summary = "Get DAW by ID with full details")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved DAW details")
    @GetMapping("/search/users")
    public List<dawDTO> getDawsByUserId(@RequestParam Long userId) {
        System.out.println("Fetching DAWs for User ID: " + userId);
        return dawService.getDawsByUserId(userId);
    }

    @GetMapping("/search/daw")
    public dawDTO getDawById(@RequestParam String dawId) {
        System.out.println("Fetching DAW with ID: " + dawId);
        System.out.println("Does the config work" + dawService.getDawById(dawId).getListOfConfigs().toString());
        return dawService.getDawById(dawId);
    }

    @GetMapping("/search/allDaws")
    public List<dawDTO> getAllDaws() {
        return dawService.getAllDaws();
    }

    @GetMapping("/search/allUsers")
    public List<userDTO> getAllUsers() {
        return this.useService.getAllUsers();
    }

    @GetMapping("/search/User")
    public userDTO getAUserById(@RequestParam Long Id) {
        return this.useService.getUserById(Id);
    }

    @GetMapping("/search/allForums")
    public List<forumPostDTO> getAllForums() {
        return this.forumService.getAllForums();
    }

    @GetMapping("/search/Forums")
    public forumPostDTO getForumById(@RequestParam Long Id) {
        return this.forumService.getForumById(Id);
    }

    @GetMapping("/search/Forums/User")
    public List<forumPostDTO> getForumByUserId(@RequestParam Long Id) {
        return this.forumService.getAllForumsByUserId(Id);
    }

    // -------------------- ratings specific --------------
    @GetMapping("/search/ratingsPage")
    public ratingsPageDTO getRatingsPageById(@RequestParam String dawId) {
        return this.ratingsService.getRatingsPageByDawId(dawId);
    }

    @GetMapping("/search/allRatingsPagesRepo")
    public List<RatingsPage> getAllRatingsPages() {
        System.out.println("All ratings pages within the database should be outputted here: ");
        this.ratingsRepo.findAll().forEach(System.out::println);
        return this.ratingsRepo.findAll();
    }

    @GetMapping("/search/allRatingsCommentsRepo")
    public List<RatingsComment> getAllRatingsComments() {

        System.out.println("The comments in the repository should be outputted here: ");
        this.ratingsCommentRepo.findAll().forEach(System.out::println);
        return this.ratingsCommentRepo.findAll();
    }

    // ---------------------------------------------------------------------

    // -------------------- notes specific --------------------------

    @GetMapping("/search/note")
    public recievedSessionNotesDTO getNoteById(@RequestParam Long Id) {

        return this.notesService.getNoteById(Id);
    }

    @GetMapping("/search/note/User")
    public List<recievedSessionNotesDTO> getNotesOfUserByUserId(@RequestParam Long Id) {
        return this.notesService.getAllNoteByUserId(Id);
    }

    // ------------------------------------------------------------------

    // ------------------- POST METHODS ------------------

    // ------------------- Daw specific ----------------------------
    // Creates an empty daw method
    @PostMapping("/save/Daw")
    public ResponseEntity<?> saveDaw(@RequestBody dawDTO payload) {

        // System.out.println("Saving DAW with ID: " + payload.getDawId() + " and name:
        // " + payload.getName());

        System.out.println("The payload that got to the backend");
        System.out.println(payload);
        System.out.println("and the settings values:");
        System.out.println(payload.getListOfConfigs().get(0).getComponents().get(0).getSettings());
        dawService.saveDaw(payload);

        return ResponseEntity.ok(payload);

    }
    // ---------------------------------------------------------------------

    // ------------------------------- Forum specific
    // -------------------------------
    // Forum based post requests
    @PostMapping("/saveForum")
    public ResponseEntity<?> saveForum(@RequestBody receivedForumDTO payload) {

        System.out.println("Saving Forum with userID: " + payload.getUserId());
        forumService.saveForum(payload);
        return ResponseEntity.ok(payload);

    }

    // -------------------------------------------------------------------------

    // ------------------------------- Comment ------------------------------------
    @PostMapping("/saveComment")
    public ResponseEntity<?> saveComment(@RequestBody receivedCommentDTO payload) {

        System.out.println(
                "Saving comment with userID: " + payload.getUserId() + ", on post: " + payload.getParentPostId());

        forumService.saveComment(payload);

        return ResponseEntity.ok(payload);

    }
    // ----------------------------------------------------------------------

    // -------------------------------- User
    // ----------------------------------------

    @PostMapping("/User/auth")
    public ResponseEntity<userDTO> login(@RequestBody recievedLoginRequest loginRequest) {
        userDTO user = useService.loginUser(loginRequest.getEmail(), loginRequest.getUserPassword());

        if (user == null) {
            // This prevents the "Unexpected end of JSON" error in React
            // because React will see the 401 and return null early.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(user);
    }
    @PostMapping("/User/register")
    public ResponseEntity<userDTO> register(@RequestBody userDTO user) {
        userDTO registeredUser = useService.registerUser(user);
        if (registeredUser == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
    }

    @PutMapping("/User/update")
    public ResponseEntity<userDTO> updateUser(@RequestBody userDTO user) {
        userDTO updatedUser = useService.updateUser(user);
        if (updatedUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/User/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean deleted = useService.deleteUser(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.noContent().build();
    }
    // -------------------------------------------------------------------

    // ------------------------------------ ratings page control
    // -------------------------

    @PostMapping("/ratings/create")
    public ratingsPageDTO createRatingsPage(@RequestBody recievedRatingsCommentDTO comment) {

        // recievedRatingsCommentDTO(
        // dawId=ef386469-4e01-4e5f-a5f3-7a825a2b2f4f,
        // ratingsPageId=null,
        // rating=5.0,
        // userId=1,
        // username=Donov,
        // comment=Does this change the database?, createdAt=2026-01-05T15:03:04.480)

        System.out.println("The comment got to the backend right? ");
        System.out.println(comment);
        ratingsPageDTO dto = ratingsService.createRatingsPage(comment);
        System.out.println("This is the DTO returned to the controller before going to the user: ");
        System.out.println(dto);
        return dto;
    }

    // --------------------------------------------------------------------------------------

    // ----------------------------------------------- Session notes
    // -----------------------------------
    @PostMapping("/notes/create")
    public recievedSessionNotesDTO createSessionNotes(@RequestBody recievedSessionNotesDTO note) {

        // recievedRatingsCommentDTO(
        // dawId=ef386469-4e01-4e5f-a5f3-7a825a2b2f4f,
        // ratingsPageId=null,
        // rating=5.0,
        // userId=1,
        // username=Donov,
        // comment=Does this change the database?, createdAt=2026-01-05T15:03:04.480)

        System.out.println("The sessionNote got to the backend right? ");
        System.out.println(note);
        recievedSessionNotesDTO dto = notesService.saveOrUpdateNote(note);
        System.out.println("This is the DTO returned to the controller before going to the user: ");
        System.out.println(dto);
        return dto;
    }
}
