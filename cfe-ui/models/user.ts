export class UserView {
  private static instance: UserView;
  
  id: string | null = null;
  email: string | null = null;
  username: string | null = null;

  private constructor() {}

  static getInstance(): UserView {
    if (!UserView.instance) {
      UserView.instance = new UserView();
    }
    return UserView.instance;
  }

  fillFromSession(sessionUser: any) {
    if (!sessionUser) {
      this.reset();
      return;
    }
    this.id = sessionUser.id ?? null;
    this.email = sessionUser.email ?? null;
    this.username = sessionUser.username ?? null;
  }

  reset() {
    this.id = null;
    this.email = null;
    this.username = null;
  }
}

export default UserView;