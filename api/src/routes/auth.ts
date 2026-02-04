import { Router } from "express";

const router = Router();

router.post("/register", (_, res) => {
  return res.send("Register");
});

export default router;
