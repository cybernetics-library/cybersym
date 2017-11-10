import numpy as np
from scipy import integrate

# This example describe how to integrate ODEs with scipy.integrate module, and how
# to use the matplotlib module to plot trajectories, direction fields and other
# useful information.
# 
# == Presentation of the Lokta-Volterra Model ==
# 
# We will have a look at the Lokta-Volterra model, also known as the
# predator-prey equations, which are a pair of first order, non-linear, differential
# equations frequently used to describe the dynamics of biological systems in
# which two species interact, one a predator and one its prey. They were proposed
# independently by Alfred J. Lotka in 1925 and Vito Volterra in 1926:
# du/dt =  a*u -   b*u*v
# dv/dt = -c*v + d*b*u*v 
# 
# with the following notations:
# 
# *  u: number of preys (for example, rabbits)
# 
# *  v: number of predators (for example, foxes)  
#   
# * a, b, c, d are constant parameters defining the behavior of the population:    
# 
#   + a is the natural growing rate of rabbits, when there's no fox
# 
#   + b is the natural dying rate of rabbits, due to predation
# 
#   + c is the natural dying rate of fox, when there's no rabbit
# 
#   + d is the factor describing how many caught rabbits let create a new fox
# 
# We will use X=[u, v] to describe the state of both populations.
# 
# Definition of the equations:
# 

def rabbit_fox_lotka_volterra_phase_curve(r_to_r=1, f_to_r=-0.1, f_to_f=-1.5, r_to_f=0.15, init_r=10, init_f=10, samples_n=100):
    a = r_to_r
    b = f_to_r * -1
    c = f_to_f * -1
    d = r_to_f
    return lotka_volterra_phase_curve(a=a, b=b, c=c, d=d, init_r=init_r, init_f=init_f, samples_n=samples_n)



#init_r = initial rabbit population
#init_f = initial fox population
def lotka_volterra_phase_curve(a=1, b=0.1, c=1.5, d=0.15, init_r=10, init_f=10, samples_n=100):
# Definition of parameters 
    def dX_dt(X, t=0):
        """ Return the growth rate of fox and rabbit populations. """
        return np.array([ a*X[0] -   b*X[0]*X[1] ,  
                      -c*X[1] + d*b*X[0]*X[1] ])
# 
# === Population equilibrium ===
# 
# Before using !SciPy to integrate this system, we will have a closer look on 
# position equilibrium. Equilibrium occurs when the growth rate is equal to 0.
# This gives two fixed points:
# 
    X_f0 = np.array([     0. ,  0.])
    X_f1 = np.array([ c/(d*b), a/b])
    all(dX_dt(X_f0) == np.zeros(2) ) and all(dX_dt(X_f1) == np.zeros(2)) # => True 
# 
# === Stability of the fixed points ===
# Near theses two points, the system can be linearized:
# dX_dt = A_f*X where A is the Jacobian matrix evaluated at the corresponding point.
# We have to define the Jacobian matrix:
# 
    def d2X_dt2(X, t=0):
        """ Return the Jacobian matrix evaluated in X. """
        return np.array([[a -b*X[1],   -b*X[0]     ],
                      [b*d*X[1] ,   -c +b*d*X[0]] ])  
# 
# So, near X_f0, which represents the extinction of both species, we have:
# A_f0 = d2X_dt2(X_f0)                    # >>> np.array([[ 1. , -0. ],
#                                         #            [ 0. , -1.5]])
# 
# Near X_f0, the number of rabbits increase and the population of foxes decrease.
# The origin is a [http://en.wikipedia.org/wiki/Saddle_point saddle point].
# 
# Near X_f1, we have:
    A_f1 = d2X_dt2(X_f1)                    # >>> np.array([[ 0.  , -2.  ],
                                            #            [ 0.75,  0.  ]])

# whose eigenvalues are +/- sqrt(c*a).j:
    lambda1, lambda2 = np.linalg.eigvals(A_f1) # >>> (1.22474j, -1.22474j)

# They are imaginary number, so the fox and rabbit populations are periodic and
# their period is given by:
    T_f1 = 2*np.pi/abs(lambda1)                # >>> 5.130199
#         
# == Integrating the ODE using scipy.integate ==
# 
# Now we will use the scipy.integrate module to integrate the ODEs.
# This module offers a method named odeint, very easy to use to integrate ODEs:
# 

    t = np.linspace(0, T_f1 + 1,  samples_n)              # time
    X0 = np.array([init_r, init_f])                     # initials conditions: 10 rabbits and 5 foxes  

    X, infodict = integrate.odeint(dX_dt, X0, t, full_output=True)

#-------------------------------------------------------
# plot trajectories
    X0 = 0.5 * X_f1                               # starting point
    X = integrate.odeint( dX_dt, X0, t)         # we don't need infodict here

    # find where it's periodic
    a = X[:,0] 
    b = X[:,1]

    firstp = np.array((a[0], b[0]))

    dists_from_start = [ np.linalg.norm(firstp - x) for x in X[1:]]
    minindex = dists_from_start.index(min(dists_from_start))

    periodicX = X[:minindex+2] # +1, plus dists_from_start is 1 smaller, so plus 2

    return (periodicX[:,0], periodicX[:,1])

def save_phase_curve_as_svg(r=None, f=None):
    import pylab as p
    f2 = p.figure()
    # plot trajectories
    p.plot( r, f, lw=1.0, color='black')
    p.axis('off')
    ymax = p.ylim(ymin=0)[1]                        # get axis limits
    xmax = p.xlim(xmin=0)[1] 
    p.xlim(0, xmax)
    p.ylim(0, ymax)
    p.gca().set_position([0, 0, 1, 1])
    f2.patch.set_alpha(0.)
    f2.savefig("test.svg", bbox_inches=0, transparent=True)

def curve_output_rounded(r=None, f=None):
    SIG_FIGS = 5
    z = [[str(round(a, SIG_FIGS)), str(round(b, SIG_FIGS))] for (a,b) in zip(r, f)]
    return z


if __name__ == "__main__":
    (r, f) = rabbit_fox_lotka_volterra_phase_curve(r_to_r=1, f_to_r=-0.1, f_to_f=-1.5, r_to_f=0.15, init_r=10, init_f=10, samples_n=100)
    print(curve_output_rounded(r=r, f=f)) #    save_phase_curve_as_svg(r=r, f=f)

